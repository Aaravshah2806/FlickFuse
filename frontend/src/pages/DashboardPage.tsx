import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Plus, RefreshCw, UserPlus, Settings, TrendingUp, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useRecommendationsStore } from '../store/recommendationsStore';
import Layout from '../components/Layout';

const TMDB_IMG = 'https://image.tmdb.org/t/p/w92';

function PlatformBadge({ platform }: { platform: string }) {
  const normalized = String(platform || '').toLowerCase();
  const className = normalized.includes('netflix') ? 'badge-netflix'
    : normalized.includes('prime') ? 'badge-prime'
    : normalized.includes('hotstar') ? 'badge-hotstar'
    : 'badge-genre';
  const label = normalized.includes('netflix') ? 'Netflix'
    : normalized.includes('prime') ? 'Prime Video'
    : normalized.includes('hotstar') ? 'Hotstar'
    : platform;
  return <span className={`badge ${className}`}>{label}</span>;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { recommendations, fetch, isLoading, source } = useRecommendationsStore();
  const navigate = useNavigate();

  useEffect(() => { fetch(); }, []);

  const copyId = () => {
    if (user?.uniqueId) {
      navigator.clipboard.writeText(user.uniqueId);
    }
  };

  const previewRecs = recommendations.slice(0, 3);

  return (
    <Layout>
      <div className="page-content page-enter">
        {/* Welcome Banner */}
        <div className="card" style={{
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '6px' }}>
                Welcome back, {user?.displayName || user?.username}! 👋
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Here's what's waiting for you today.</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', padding: '10px 16px',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '2px' }}>YOUR UNIQUE ID</div>
                <div style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 700, color: 'var(--color-primary-light)', fontSize: '1rem' }}>
                  {user?.uniqueId || '---'}
                </div>
              </div>
              <button onClick={copyId} className="btn btn-ghost btn-sm" title="Copy ID"><Copy size={14} /></button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '40px' }}>
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { icon: <Plus size={20} />, label: 'Import Data', sub: 'Add watch history', path: '/import', color: 'var(--color-primary)' },
              { icon: <RefreshCw size={20} />, label: 'Get Recs', sub: 'AI recommendations', path: '/recommendations', color: 'var(--color-accent)' },
              { icon: <UserPlus size={20} />, label: 'Add Friend', sub: 'By unique ID', path: '/friends', color: 'var(--color-success)' },
              { icon: <Settings size={20} />, label: 'Settings', sub: 'Profile & privacy', path: '/settings', color: 'var(--color-text-muted)' },
            ].map((action) => (
              <button key={action.label} onClick={() => navigate(action.path)}
                style={{
                  background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center',
                  cursor: 'pointer', flex: '1', minWidth: '120px', transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = action.color; (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-card)'; }}>
                <div style={{ color: action.color, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{action.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{action.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>{action.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations Preview */}
        <div style={{ marginBottom: '40px' }}>
          <div className="section-header">
            <h2 className="section-title">
              <TrendingUp size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
              Recommendations For You
            </h2>
            <Link to="/recommendations" className="section-link">View all →</Link>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '90px' }} />)}
            </div>
          ) : previewRecs.length === 0 ? (
            <div className="card">
              <div className="empty-state" style={{ padding: '40px' }}>
                <div className="empty-state-icon">🎬</div>
                <div className="empty-state-title">No recommendations yet</div>
                <div className="empty-state-desc">Import your watch history to get personalized AI picks</div>
                <Link to="/import" className="btn btn-primary" style={{ marginTop: '8px' }}>
                  <Plus size={16} /> Import Now
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {previewRecs.map((rec, i) => (
                <div key={i} className="poster-card">
                  {rec.posterPath ? (
                    <img src={`${TMDB_IMG}${rec.posterPath}`} alt={rec.title} className="poster-img"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="poster-img-placeholder">🎬</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{rec.title}</span>
                      <span style={{
                        background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)',
                        fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)',
                      }}>{rec.matchScore}% match</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      {(rec.genres || []).slice(0, 3).map((g) => (
                        <span key={g} className="badge badge-genre" style={{ fontSize: '0.7rem' }}>{g}</span>
                      ))}
                      {(rec.platforms || [rec.platform]).filter(Boolean).slice(0, 1).map((p) => (
                        <PlatformBadge key={String(p)} platform={String(p)} />
                      ))}
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>{rec.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {source === 'mock' && (
            <div className="alert alert-info" style={{ marginTop: '12px' }}>
              💡 These are sample recommendations. Import your watch history for personalized picks.
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="section-header">
            <h2 className="section-title">
              <Clock size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
              Getting Started
            </h2>
          </div>
          <div className="grid-3">
            {[
              { emoji: '1️⃣', title: 'Import Watch History', desc: 'Start by uploading your Netflix or Prime CSV', path: '/import', cta: 'Import Now' },
              { emoji: '2️⃣', title: 'Find Friends', desc: 'Add friends using their unique StreamSync ID', path: '/friends', cta: 'Find Friends' },
              { emoji: '3️⃣', title: 'Create Lists', desc: 'Curate and share your favourite watch lists', path: '/lists', cta: 'Create List' },
            ].map((step) => (
              <div key={step.title} className="card card-hover">
                <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{step.emoji}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '16px', lineHeight: 1.6 }}>{step.desc}</p>
                <Link to={step.path} className="btn btn-secondary btn-sm">{step.cta} →</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
