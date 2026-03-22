import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  parseNetflixCSV, 
  parsePrimeVideoCSV, 
  parseHotstarCSV, 
  getPreviewEntries, 
  getEntryStats, 
  type ParsedEntry 
} from '../lib/csvParser';
import { batchMatch, type MatchResult } from '../lib/tmdbMatcher';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type Platform = 'netflix' | 'prime' | 'hotstar';

interface ImportState {
  phase: 'select' | 'preview' | 'matching' | 'importing' | 'complete';
  platform: Platform | null;
  entries: ParsedEntry[];
  matches: MatchResult[];
  progress: { current: number; total: number };
  stats: ReturnType<typeof getEntryStats>;
  imported: number;
  skipped: number;
  errors: string[];
}

const PLATFORMS: { id: Platform; name: string; logo: string; disabled: boolean; description: string }[] = [
  { id: 'netflix', name: 'Netflix', logo: 'N', disabled: false, description: 'Export from Netflix Viewing Activity' },
  { id: 'prime', name: 'Prime Video', logo: 'P', disabled: false, description: 'Export from Prime Video Watch History' },
  { id: 'hotstar', name: 'Hotstar', logo: 'H', disabled: false, description: 'Export from Disney+ Hotstar' },
];

export default function Import() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<ImportState>({
    phase: 'select',
    platform: null,
    entries: [],
    matches: [],
    progress: { current: 0, total: 0 },
    stats: { total: 0, movies: 0, series: 0, uniqueShows: 0, dateRange: null },
    imported: 0,
    skipped: 0,
    errors: [],
  });
  const [dragActive, setDragActive] = useState(false);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setParseErrors(['Please upload a CSV file']);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setParseErrors(['File size must be less than 10MB']);
      return;
    }

    try {
      const text = await file.text();
      let result;
      
      switch (state.platform) {
        case 'netflix':
          result = parseNetflixCSV(text);
          break;
        case 'prime':
          result = parsePrimeVideoCSV(text);
          break;
        case 'hotstar':
          result = parseHotstarCSV(text);
          break;
        default:
          result = parseNetflixCSV(text);
      }
      
      if (result.entries.length === 0) {
        setParseErrors(result.errors.length > 0 ? result.errors : ['No valid entries found']);
        return;
      }

      setParseErrors([]);
      setState(prev => ({
        ...prev,
        phase: 'preview',
        entries: result.entries,
        stats: getEntryStats(result.entries),
      }));
    } catch {
      setParseErrors(['Failed to read file. Please check the format.']);
    }
  }, [state.platform]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  const startMatching = useCallback(async () => {
    setState(prev => ({ ...prev, phase: 'matching' }));
    
    const results = await batchMatch(state.entries, (current, total) => {
      setState(prev => ({
        ...prev,
        progress: { current, total },
      }));
    });

    setState(prev => ({
      ...prev,
      phase: 'importing',
      matches: results.results,
      progress: { current: 0, total: results.matched },
    }));

    await importToDatabase(results.results);
  }, [state.entries]);

  const importToDatabase = async (matches: MatchResult[]) => {
    if (!profile) return;

    const platformIds: Record<Platform, string> = {
      netflix: '00000000-0000-0000-0000-000000000001',
      prime: '00000000-0000-0000-0000-000000000002',
      hotstar: '00000000-0000-0000-0000-000000000003',
    };

    const matchedEntries = matches.filter(m => m.status === 'matched' && m.match);
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const match of matchedEntries) {
      try {
        const { entry, match: tmdbMatch } = match;
        if (!tmdbMatch) {
          skipped++;
          continue;
        }

        const { error } = await supabase.rpc('add_watch_history_entry', {
          p_user_id: profile.id,
          p_platform_id: platformIds[state.platform || 'netflix'],
          p_content_title: entry.showName || entry.title,
          p_content_type: entry.type,
          p_watched_date: entry.date.toISOString().split('T')[0],
          p_tmdb_id: tmdbMatch.tmdb_id,
          p_poster_url: tmdbMatch.poster_url,
          p_season_number: entry.season || null,
          p_episode_number: entry.episode || null,
          p_episode_title: entry.episodeName || null,
          p_release_year: tmdbMatch.release_year || null,
          p_description: tmdbMatch.overview || null,
        });

        if (error) {
          console.error('Import error:', error);
          errors.push(`Failed to import: ${entry.title}`);
        } else {
          imported++;
        }
      } catch (err) {
        console.error('Error:', err);
        skipped++;
      }

      setState(prev => ({
        ...prev,
        progress: { ...prev.progress, current: prev.progress.current + 1 },
      }));
    }

    setState(prev => ({
      ...prev,
      phase: 'complete',
      imported,
      skipped: skipped + matches.filter(m => m.status !== 'matched').length,
      errors,
    }));
  };

  const reset = () => {
    setState({
      phase: 'select',
      platform: null,
      entries: [],
      matches: [],
      progress: { current: 0, total: 0 },
      stats: { total: 0, movies: 0, series: 0, uniqueShows: 0, dateRange: null },
      imported: 0,
      skipped: 0,
      errors: [],
    });
    setParseErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectPlatform = (platform: Platform) => {
    setState(prev => ({ ...prev, platform }));
  };

  const renderPhase = () => {
    switch (state.phase) {
      case 'select':
        return renderSelectPhase();
      case 'preview':
        return renderPreviewPhase();
      case 'matching':
        return renderMatchingPhase();
      case 'importing':
        return renderImportingPhase();
      case 'complete':
        return renderCompletePhase();
      default:
        return null;
    }
  };

  const renderSelectPhase = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Select Platform</h2>
        <p className="text-gray-600 mb-4">Choose the streaming platform to import your watch history from.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLATFORMS.map(platform => (
          <button
            key={platform.id}
            onClick={() => selectPlatform(platform.id)}
            disabled={platform.disabled}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              platform.disabled
                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                : state.platform === platform.id
                ? 'border-[#2563EB] bg-blue-50'
                : 'border-gray-200 hover:border-[#2563EB] hover:bg-gray-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3 ${
              platform.id === 'netflix' ? 'bg-red-600' :
              platform.id === 'prime' ? 'bg-blue-600' : 'bg-orange-500'
            }`}>
              {platform.logo}
            </div>
            <h3 className="font-semibold">{platform.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{platform.description}</p>
            {platform.disabled && (
              <Badge variant="default" size="sm" className="mt-2">Coming Soon</Badge>
            )}
          </button>
        ))}
      </div>

      {state.platform && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Upload CSV File</h3>
          <p className="text-sm text-gray-600 mb-4">
            Export your watch history from {PLATFORMS.find(p => p.id === state.platform)?.name}. 
            The file should have "Title" and "Date" columns.
          </p>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-[#2563EB] bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500 mt-1">CSV files only, max 10MB</p>
            </label>
          </div>

          {parseErrors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              {parseErrors.map((error, i) => (
                <p key={i} className="text-red-600 text-sm">{error}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPreviewPhase = () => {
    const preview = getPreviewEntries(state.entries);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Preview Import</h2>
            <p className="text-gray-600">Review your data before importing</p>
          </div>
          <Button variant="secondary" onClick={reset}>Cancel</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-[#2563EB]">{state.stats.total}</div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{state.stats.movies}</div>
            <div className="text-sm text-gray-600">Movies</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{state.stats.series}</div>
            <div className="text-sm text-gray-600">TV Episodes</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{state.stats.uniqueShows}</div>
            <div className="text-sm text-gray-600">Unique Shows</div>
          </Card>
        </div>

        {state.stats.dateRange && (
          <Card className="p-4">
            <p className="text-sm text-gray-600">
              Watch history spans from{' '}
              <span className="font-medium">{state.stats.dateRange.earliest.toLocaleDateString()}</span>
              {' '}to{' '}
              <span className="font-medium">{state.stats.dateRange.latest.toLocaleDateString()}</span>
            </p>
          </Card>
        )}

        <div>
          <h3 className="font-medium mb-2">First 10 Entries</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Title</th>
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((entry, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 px-3">
                      <Badge variant={entry.type === 'movie' ? 'default' : 'prime'} size="sm">
                        {entry.type === 'movie' ? 'Movie' : 'Series'}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 font-medium">{entry.showName || entry.title}</td>
                    <td className="py-2 px-3 text-gray-600">{entry.date.toLocaleDateString()}</td>
                    <td className="py-2 px-3 text-gray-500">
                      {entry.season && `S${entry.season}`}
                      {entry.episode && ` E${entry.episode}`}
                      {entry.episodeName && ` - ${entry.episodeName}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="secondary" onClick={reset}>Cancel</Button>
          <Button onClick={startMatching}>
            Continue to Import
          </Button>
        </div>
      </div>
    );
  };

  const renderMatchingPhase = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <h2 className="text-xl font-semibold mb-2">Matching with TMDB...</h2>
      <p className="text-gray-600">
        Finding matches for {state.stats.uniqueShows} unique shows and movies
      </p>
      <div className="mt-6 max-w-md mx-auto">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#2563EB] transition-all duration-300"
            style={{ width: `${(state.progress.current / state.progress.total) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {state.progress.current} of {state.progress.total}
        </p>
      </div>
    </div>
  );

  const renderImportingPhase = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <h2 className="text-xl font-semibold mb-2">Importing to Database...</h2>
      <p className="text-gray-600">
        Saving your watch history
      </p>
      <div className="mt-6 max-w-md mx-auto">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(state.progress.current / state.progress.total) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {state.progress.current} of {state.progress.total} entries
        </p>
      </div>
    </div>
  );

  const renderCompletePhase = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Import Complete!</h2>
      
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{state.imported}</div>
          <div className="text-sm text-gray-600">Imported</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-400">{state.skipped}</div>
          <div className="text-sm text-gray-600">Skipped</div>
        </Card>
      </div>

      {state.errors.length > 0 && (
        <div className="mt-6 max-w-md mx-auto text-left">
          <p className="text-sm text-gray-600 mb-2">Some entries could not be imported:</p>
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-600">
            {state.errors.slice(0, 5).map((err, i) => (
              <p key={i}>{err}</p>
            ))}
            {state.errors.length > 5 && <p>...and {state.errors.length - 5} more</p>}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4 mt-8">
        <Button variant="secondary" onClick={reset}>Import More</Button>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    </div>
  );

  return (
    <div className="pb-20 md:pb-0">
      <h1 className="text-2xl font-bold mb-6">Import Watch History</h1>
      {renderPhase()}
    </div>
  );
}
