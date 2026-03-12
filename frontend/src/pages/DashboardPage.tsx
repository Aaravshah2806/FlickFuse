import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Plus, UserPlus, Settings, TrendingUp, Clock, Bell, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useRecommendationsStore } from '../store/recommendationsStore';
import { useWatchHistoryStore } from '../store/watchHistoryStore';
import Layout from '../components/Layout';

function PlatformBadge({ platform }: { platform: string }) {
  const normalized = String(platform || '').toLowerCase();
  const className = normalized.includes('netflix') ? 'badge-netflix'
    : normalized.includes('prime') ? 'badge-prime'
    : normalized.includes('hotstar') ? 'badge-hotstar'
    : 'badge-genre';
  return <span className={`badge ${className}`}>{platform}</span>;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { recommendations, fetch, isLoading } = useRecommendationsStore();
  const { history, fetchHistory, isLoading: isLoadingHistory } = useWatchHistoryStore();
  const navigate = useNavigate();

  useEffect(() => { 
    fetch(); 
    fetchHistory();
  }, []);

  const copyId = () => {
    if (user?.uniqueId) {
      navigator.clipboard.writeText(user.uniqueId);
    }
  };

  return (
    <Layout>
      <div className="page-content page-enter">
        {/* Bento Grid Header Area */}
        <div className="bento-grid" style={{ marginBottom: '40px' }}>
          
          {/* Welcome Card (Main Bento) */}
          <div className="card" style={{
            gridColumn: 'span 8',
            gridRow: 'span 2',
            background: 'radial-gradient(circle at top left, rgba(0,255,157,0.1), transparent), var(--color-bg-card)',
            border: '1px solid rgba(0,255,157,0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '16px' }}>
              <Zap size={20} fill="currentColor" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>Active Session</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '12px', letterSpacing: '-1px' }}>
              Welcome back, <br/>{user?.displayName || user?.username}!
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '400px', lineHeight: 1.6 }}>
              Your taste profile is synchronized. {isLoading ? 'Gathering fresh picks for you...' : `You have ${recommendations.length} new recommendations waiting.`}
            </p>
          </div>

          {/* Quick Stats / ID Card */}
          <div className="card" style={{
            gridColumn: 'span 4',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)'
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>FlickFuse ID</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'Space Mono' }}>{user?.uniqueId || '---'}</span>
              <button onClick={copyId} className="btn btn-ghost btn-sm"><Copy size={16} /></button>
            </div>
          </div>

          {/* Activity / Notification Card */}
          <div className="card" style={{
            gridColumn: 'span 4',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
              <Bell size={24} color="var(--color-error)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Recent Alerts</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No new notifications</div>
            </div>
          </div>

        </div>

        {/* Action Center */}
        <div style={{ marginBottom: '48px' }}>
          <div className="section-header">
            <h2 className="section-title">Action Center</h2>
          </div>
          <div className="grid-4">
            {[
              { icon: <Plus />, label: 'Import', path: '/import' },
              { icon: <TrendingUp />, label: 'Recs', path: '/recommendations' },
              { icon: <UserPlus />, label: 'Friends', path: '/friends' },
              { icon: <Settings />, label: 'Settings', path: '/settings' },
            ].map((action) => (
              <button key={action.label} onClick={() => navigate(action.path)} className="card card-hover" style={{ 
                textAlign: 'center', padding: '32px', cursor: 'pointer',
                background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
              }}>
                <div style={{ color: 'var(--color-primary)', filter: 'drop-shadow(0 0 8px rgba(0,255,157,0.3))' }}>{action.icon}</div>
                <span style={{ fontWeight: 600 }}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations Section */}
        <div style={{ marginBottom: '48px' }}>
          <div className="section-header">
            <h2 className="section-title">
              <TrendingUp size={20} style={{ marginRight: '12px', color: 'var(--color-primary)' }} />
              Top Recommendations
            </h2>
            <Link to="/recommendations" className="section-link">Explore all</Link>
          </div>

          {isLoading ? (
            <div className="grid-3">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '300px' }} />)}
            </div>
          ) : (
            <div className="grid-3">
              {recommendations.slice(0, 3).map((rec, i) => (
                <div key={i} className="card card-hover" style={{ padding: '0', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', height: '300px' }}>
                    {rec.posterPath ? (
                      <img src={`https://image.tmdb.org/t/p/w500${rec.posterPath}`} alt={rec.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🎬</div>
                    )}
                    <div style={{ 
                      position: 'absolute', inset: 0, 
                      background: 'linear-gradient(to top, rgba(9,9,11,0.9), transparent)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                      padding: '20px'
                    }}>
                      <div className="match-score" style={{ marginBottom: '8px' }}>
                        <span className="badge badge-success" style={{ background: 'var(--color-success)', color: 'white' }}>
                          {rec.matchScore !== undefined ? `${rec.matchScore}% Match` : 'New Match'}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>{rec.title}</h3>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {rec.genres?.slice(0, 2).map((g) => <span key={g} className="badge badge-genre">{g}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Watch History Horizontal Scroll */}
        <div style={{ marginBottom: '48px' }}>
          <div className="section-header">
            <h2 className="section-title">
              <Clock size={20} style={{ marginRight: '12px', color: 'var(--color-secondary)' }} />
              Recently Watched
            </h2>
          </div>
          <div style={{ 
            display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px',
            scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch'
          }}>
            {isLoadingHistory ? (
              [1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ width: '180px', height: '260px', flexShrink: 0 }} />)
            ) : (
              history.slice(0, 10).map((event) => (
                <div key={event.id} className="card card-hover" style={{ 
                  flexShrink: 0, width: '180px', padding: '0', overflow: 'hidden', scrollSnapAlign: 'start'
                }}>
                  <div style={{ height: '240px', position: 'relative' }}>
                    {event.posterPath ? (
                      <img src={`https://image.tmdb.org/t/p/w342${event.posterPath}`} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎬</div>
                    )}
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                      <PlatformBadge platform={event.platform} />
                    </div>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</h4>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
