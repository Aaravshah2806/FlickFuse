import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Plus, RefreshCw, UserPlus, Settings, TrendingUp, Clock, Bell } from 'lucide-react';
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

const ACTION_NEONS = {
  'Import Data': '#00FF9F',
  'Get Recs': '#00D4FF',
  'Add Friend': '#BF5AF2',
  'Settings': '#8888AA',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { recommendations, fetch, fetchReleaseRadar, alerts, isLoading, source } = useRecommendationsStore();
  const navigate = useNavigate();

  useEffect(() => { fetch(); fetchReleaseRadar(); }, []);

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
          background: 'linear-gradient(135deg, rgba(0,255,159,0.06), rgba(0,212,255,0.04))',
          border: '1px solid rgba(0,255,159,0.12)',
          boxShadow: '0 0 40px rgba(0,255,159,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '1.6rem', fontWeight: 700, marginBottom: '6px',
                letterSpacing: '-0.5px',
              }}>
                Welcome back, {user?.displayName || user?.username}! ⚡
              </h1>
              <p style={{ color: '#8888AA', fontSize: '0.85rem' }}>// here's what's waiting for you today</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,159,0.15)',
              borderRadius: 'var(--radius-md)', padding: '10px 16px',
            }}>
              <div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.65rem', color: '#3A3A52', fontWeight: 400,
                  letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px',
                }}>YOUR UNIQUE ID</div>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontWeight: 700,
                  color: '#00FF9F', fontSize: '1rem',
                  textShadow: '0 0 8px rgba(0,255,159,0.3)',
                }}>
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
              { icon: <Plus size={20} />, label: 'Import Data', sub: 'Add watch history', path: '/import' },
              { icon: <RefreshCw size={20} />, label: 'Get Recs', sub: 'AI recommendations', path: '/recommendations' },
              { icon: <UserPlus size={20} />, label: 'Add Friend', sub: 'By unique ID', path: '/friends' },
              { icon: <Settings size={20} />, label: 'Settings', sub: 'Profile & privacy', path: '/settings' },
            ].map((action) => {
              const neon = ACTION_NEONS[action.label as keyof typeof ACTION_NEONS] || '#8888AA';
              return (
                <button key={action.label} onClick={() => navigate(action.path)}
                  style={{
                    background: 'var(--color-bg-card)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center',
                    cursor: 'pointer', flex: '1', minWidth: '120px',
                    transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
                    fontFamily: 'inherit', color: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${neon}40`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${neon}15`;
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-card)';
                  }}>
                  <div style={{ color: neon, marginBottom: '8px', display: 'flex', justifyContent: 'center', filter: `drop-shadow(0 0 8px ${neon}40)` }}>{action.icon}</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{action.label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#3A3A52', fontFamily: "'Space Mono', monospace" }}>{action.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommendations Preview */}
        <div style={{ marginBottom: '40px' }}>
          <div className="section-header">
            <h2 className="section-title">
              <TrendingUp size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: '#00FF9F' }} />
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
                      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem' }}>{rec.title}</span>
                      <span style={{
                        background: 'rgba(48,209,88,0.12)', color: '#30D158',
                        fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                        borderRadius: 'var(--radius-full)', border: '1px solid rgba(48,209,88,0.2)',
                        fontFamily: "'Space Mono', monospace",
                      }}>{rec.matchScore}% match</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      {(rec.genres || []).slice(0, 3).map((g) => (
                        <span key={g} className="badge badge-genre">{g}</span>
                      ))}
                      {(rec.platforms || [rec.platform]).filter(Boolean).slice(0, 1).map((p) => (
                        <PlatformBadge key={String(p)} platform={String(p)} />
                      ))}
                    </div>
                    <p style={{ color: '#8888AA', fontSize: '0.8rem', lineHeight: 1.5 }}>{rec.reason}</p>
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

        {/* Release Radar */}
        {alerts && alerts.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div className="section-header">
              <h2 className="section-title">
                <Bell size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: '#FF453A' }} />
                Release Radar alerts
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.map((alert: any) => (
                <div key={alert.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px 20px', borderLeft: '4px solid #FF453A' }}>
                  <div style={{ background: 'rgba(255,69,58,0.1)', padding: '12px', borderRadius: '50%' }}>
                    <Bell size={20} color="#FF453A" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                      {alert.title} <span className="badge badge-genre" style={{ marginLeft: '8px' }}>{alert.genre}</span>
                    </h3>
                    <p style={{ color: '#8888AA', fontSize: '0.85rem' }}>{alert.message}</p>
                    <div style={{ marginTop: '8px' }}>
                      <PlatformBadge platform={alert.platform} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <div className="section-header">
            <h2 className="section-title">
              <Clock size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: '#00D4FF' }} />
              Getting Started
            </h2>
          </div>
          <div className="grid-3">
            {[
              { num: '01', title: 'Import Watch History', desc: 'Start by uploading your Netflix or Prime CSV', path: '/import', cta: 'Import Now', neon: '#00FF9F' },
              { num: '02', title: 'Find Friends', desc: 'Add friends using their unique FlickFuse ID', path: '/friends', cta: 'Find Friends', neon: '#00D4FF' },
              { num: '03', title: 'Create Lists', desc: 'Curate and share your favourite watch lists', path: '/lists', cta: 'Create List', neon: '#BF5AF2' },
            ].map((step) => (
              <div key={step.title} className="card card-hover">
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '1.5rem', fontWeight: 700,
                  color: step.neon, opacity: 0.3, marginBottom: '12px',
                  textShadow: `0 0 16px ${step.neon}40`,
                }}>{step.num}</div>
                <h3 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px',
                }}>{step.title}</h3>
                <p style={{ color: '#8888AA', fontSize: '0.82rem', marginBottom: '16px', lineHeight: 1.6 }}>{step.desc}</p>
                <Link to={step.path} className="btn btn-secondary btn-sm">{step.cta} →</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
