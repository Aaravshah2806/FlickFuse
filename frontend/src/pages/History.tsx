import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../lib/supabase';

interface WatchHistoryEntry {
  id: string;
  content_title: string;
  content_type: 'movie' | 'series';
  watched_date: string;
  season_number?: number;
  episode_number?: number;
  episode_title?: string;
  platform?: { name: string; display_name: string };
  content?: { poster_url?: string; tmdb_id?: number };
}

export default function History() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const loadHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('watch_history')
        .select(`
          *,
          platform:platforms(*),
          content:content(*)
        `)
        .eq('user_id', user.id);

      if (filterPlatform !== 'all') {
        query = query.eq('platform_id', filterPlatform);
      }

      if (filterType !== 'all') {
        query = query.eq('content_type', filterType);
      }

      query = query.order('watched_date', { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filterPlatform, filterType, sortOrder]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      loadHistory();
    }
  }, [user, loadHistory]);

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('watch_history').delete().eq('id', id);
      if (error) throw error;
      setEntries(entries.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const clearAllHistory = async () => {
    if (!confirm('Are you sure you want to delete all watch history? This cannot be undone.')) return;

    try {
      const { error } = await supabase.from('watch_history').delete().eq('user_id', user?.id);
      if (error) throw error;
      setEntries([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupByDate = (entries: WatchHistoryEntry[]) => {
    const groups: { [key: string]: WatchHistoryEntry[] } = {};
    entries.forEach((entry) => {
      const date = entry.watched_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });
    return groups;
  };

  const groupedEntries = groupByDate(entries);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Watch History</h1>
        {entries.length > 0 && (
          <button
            onClick={clearAllHistory}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            Clear All History
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            <option value="netflix">Netflix</option>
            <option value="prime">Prime Video</option>
            <option value="hotstar">Hotstar</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="movie">Movies</option>
            <option value="series">TV Shows</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2563EB] border-t-transparent"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">No watch history yet</p>
          <p className="text-sm mt-1">Import your viewing history to get started</p>
          <Link
            to="/import"
            className="inline-block mt-4 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors"
          >
            Import History
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([date, dateEntries]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-gray-500 mb-3">
                {formatDate(date)}
              </h2>
              <div className="space-y-3">
                {dateEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-16 h-24 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                      {entry.content?.poster_url ? (
                        <img
                          src={getImageUrl(entry.content.poster_url)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/content/${entry.content_type}/${entry.content?.tmdb_id || entry.id}`}
                        className="font-medium text-gray-900 hover:text-[#2563EB] truncate block"
                      >
                        {entry.content_title}
                        {entry.season_number && entry.episode_number && (
                          <span className="text-gray-500 font-normal">
                            {' '}
                            S{entry.season_number}E{entry.episode_number}
                            {entry.episode_title && `: ${entry.episode_title}`}
                          </span>
                        )}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          entry.content_type === 'movie'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {entry.content_type === 'movie' ? 'Movie' : 'TV Show'}
                        </span>
                        {entry.platform && (
                          <span className="text-xs">{entry.platform.display_name}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      title="Remove from history"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
