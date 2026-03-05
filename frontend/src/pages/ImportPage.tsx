import { useState, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';

type Platform = 'netflix' | 'prime' | 'hotstar';
type Status = 'idle' | 'uploading' | 'success' | 'error';

const PLATFORMS: { id: Platform; label: string; color: string; csvInfo: string; steps: string[] }[] = [
  {
    id: 'netflix',
    label: '🎬 Netflix',
    color: 'var(--color-netflix)',
    csvInfo: 'Columns expected: "Title", "Date"',
    steps: [
      'Go to netflix.com and log in',
      'Click your profile icon → Account',
      'Scroll to "My Profile" → "Viewing Activity"',
      'Click "Download All" at the bottom of the page',
      'Save the CSV file and upload it below',
    ],
  },
  {
    id: 'prime',
    label: '📦 Prime Video',
    color: 'var(--color-prime)',
    csvInfo: 'Columns expected: "Title", "WatchedDate"',
    steps: [
      'Go to Amazon Prime Video website',
      'Click Account → "Watch History"',
      'Look for the export/download option',
      'Download the CSV file',
      'Upload it below',
    ],
  },
  {
    id: 'hotstar',
    label: '⭐ Hotstar',
    color: 'var(--color-hotstar)',
    csvInfo: 'Columns expected: "Title", "Watch Date" or "Timestamp"',
    steps: [
      'Open Hotstar in a browser (hotstar.com)',
      'Go to your profile → Watch History',
      'Click Export or Download History',
      'Download the CSV',
      'Upload it below',
    ],
  },
];

export default function ImportPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('netflix');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{stats: {imported:number;duplicates:number;invalid:number;totalRows:number}}|null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const platform = PLATFORMS.find((p) => p.id === selectedPlatform)!;

  const handleFile = (f: File) => {
    setFile(f);
    setStatus('idle');
    setResult(null);
    setError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.csv')) handleFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setProgress(0);
    setError(null);

    // Simulate progress
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 20, 85));
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post(`/api/import/${selectedPlatform}`, formData);
      clearInterval(progressTimer);
      setProgress(100);
      setResult(data);
      setStatus('success');
    } catch (err: unknown) {
      clearInterval(progressTimer);
      const msg = (err as {response?: {data?: {error?: string}}}).response?.data?.error || 'Upload failed';
      setError(msg);
      setStatus('error');
    }
  };

  return (
    <Layout>
      <div className="page-content page-enter">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>Import Watch History</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
          Export your viewing history from a streaming platform and upload it below.
        </p>

        {/* Platform Tabs */}
        <div className="tabs" style={{ marginBottom: '32px', maxWidth: '400px' }}>
          {PLATFORMS.map((p) => (
            <button key={p.id} className={`tab${selectedPlatform === p.id ? ' active' : ''}`}
              onClick={() => { setSelectedPlatform(p.id); setFile(null); setStatus('idle'); setResult(null); setError(null); }}>
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Steps */}
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '20px', color: platform.color }}>How to Export from {platform.label}</h2>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {platform.steps.map((step, i) => (
                <li key={i} style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {step}
                </li>
              ))}
            </ol>
            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>
              📋 {platform.csvInfo}
            </div>
          </div>

          {/* Upload Zone */}
          <div>
            <div
              className={`dropzone${isDragOver ? ' active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              style={{ marginBottom: '16px', cursor: 'pointer' }}
            >
              <input id="file-input" type="file" accept=".csv" style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <Upload size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              {file ? (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{file.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {(file.size / 1024).toFixed(1)} KB · Click to change
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Drag & drop your CSV here</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>or click to browse · max 50MB</div>
                </div>
              )}
            </div>

            {/* Progress */}
            {status === 'uploading' && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing…
                  </span>
                  <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Error */}
            {status === 'error' && error && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Success */}
            {status === 'success' && result && (
              <div className="card" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <CheckCircle size={20} color="var(--color-success)" />
                  <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>Import Complete!</span>
                </div>
                {[
                  { label: 'Total Rows', val: result.stats.totalRows },
                  { label: 'Imported', val: result.stats.imported },
                  { label: 'Duplicates Skipped', val: result.stats.duplicates },
                  { label: 'Invalid Rows', val: result.stats.invalid },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                    <span style={{ fontWeight: 700 }}>{val}</span>
                  </div>
                ))}
                <p style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Your taste profile is being updated. Check Recommendations soon!
                </p>
              </div>
            )}

            <button className="btn btn-primary btn-full" disabled={!file || status === 'uploading'} onClick={handleUpload}>
              {status === 'uploading' ? 'Uploading…' : `Upload ${platform.label} CSV`}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
}
