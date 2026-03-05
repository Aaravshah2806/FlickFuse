import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, RefreshCw, ThumbsDown, Check, BookmarkPlus } from 'lucide-react';
import Layout from '../components/Layout';
import { useRecommendationsStore, Recommendation } from '../store/recommendationsStore';

const TMDB_IMG = 'https://image.tmdb.org/t/p/w185';

function PlatformBadge({ platform }: { platform: string }) {
  const n = String(platform || '').toLowerCase();
  const cls = n.includes('netflix') ? 'badge-netflix' : n.includes('prime') ? 'badge-prime' : n.includes('hotstar') ? 'badge-hotstar' : 'badge-genre';
  const label = n.includes('netflix') ? 'Netflix' : n.includes('prime') ? 'Prime Video' : n.includes('hotstar') ? 'Hotstar' : platform;
  return <span className={`badge ${cls}`}>{label}</span>;
}

function RecCard({ rec, onFeedback }: { rec: Recommendation; onFeedback: (id: string, f: string) => void }) {
  const [feedbackSent, setFeedbackSent] = useState<string | null>(rec.userFeedback || null);

  const handleFeedback = (f: string) => {
    if (!rec.id) return;
    setFeedbackSent(f);
    onFeedback(rec.id, f);
  };

  const platforms = rec.platforms || (rec.platform ? [rec.platform] : []);

  return (
    <div className="poster-card" style={{ opacity: feedbackSent === 'not_interested' ? 0.4 : 1, transition: 'opacity 0.3s' }}>
      {rec.posterPath ? (
        <img src={`${TMDB_IMG}${rec.posterPath}`} alt={rec.title} className="poster-img"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }} />
      ) : (
        <div className="poster-img-placeholder">🎬</div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>{rec.title}</h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(rec.genres || []).slice(0, 3).map((g) => <span key={g} className="badge badge-genre" style={{ fontSize: '0.7rem' }}>{g}</span>)}
              {platforms.slice(0, 1).map((p) => <PlatformBadge key={String(p)} platform={String(p)} />)}
            </div>
          </div>
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 'var(--radius-full)', padding: '4px 12px',
            fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-success)', whiteSpace: 'nowrap',
          }}>
            {rec.matchScore}% match
          </div>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '12px' }}>
          {rec.reason}
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => handleFeedback('watched')}
            className={`btn btn-sm ${feedbackSent === 'watched' ? 'btn-primary' : 'btn-secondary'}`}>
            <Check size={13} /> {feedbackSent === 'watched' ? 'Watched ✓' : 'Watched'}
          </button>
          <button onClick={() => handleFeedback('want_to_watch')}
            className={`btn btn-sm ${feedbackSent === 'want_to_watch' ? 'btn-secondary' : 'btn-ghost'}`}
            style={feedbackSent === 'want_to_watch' ? { color: 'var(--color-accent)', borderColor: 'var(--color-accent)' } : {}}>
            <BookmarkPlus size={13} /> Watchlist
          </button>
          <button onClick={() => handleFeedback('not_interested')} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)', opacity: 0.7 }}>
            <ThumbsDown size={13} /> Not for me
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const { recommendations, isLoading, fetch, generate, submitFeedback, source, error } = useRecommendationsStore();
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { fetch(); }, []);

  const filters = ['all', 'netflix', 'prime', 'hotstar'];

  const filtered = filter === 'all' ? recommendations : recommendations.filter((r) => {
    const platforms = (r.platforms || (r.platform ? [r.platform] : [])).join(' ').toLowerCase();
    return platforms.includes(filter);
  });

  return (
    <Layout>
      <div className="page-content page-enter">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            <Sparkles size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-primary-light)' }} />
            Recommendations For You
          </h1>
          <button onClick={generate} className="btn btn-primary btn-sm" disabled={isLoading}>
            <RefreshCw size={15} className={isLoading ? 'spinning' : ''} />
            {isLoading ? 'Generating…' : 'Refresh'}
          </button>
        </div>

        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
          Personalised picks based on your taste profile
        </p>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}>
              {f === 'all' ? '⭐ All' : f === 'netflix' ? '🎬 Netflix' : f === 'prime' ? '📦 Prime' : '⭐ Hotstar'}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

        {source === 'mock' && (
          <div className="alert alert-info" style={{ marginBottom: '16px' }}>
            💡 Sample recommendations shown. <Link to="/import" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Import your watch history</Link> for personalised AI picks.
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: '140px' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🎬</div>
              <div className="empty-state-title">No recommendations yet</div>
              <div className="empty-state-desc">Import your watch history or click Refresh to generate recommendations</div>
              <Link to="/import" className="btn btn-primary" style={{ marginTop: '8px' }}>Import Watch History</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((rec, i) => (
              <RecCard key={rec.id || i} rec={rec} onFeedback={submitFeedback} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
