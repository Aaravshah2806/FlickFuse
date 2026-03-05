import { useState, useEffect } from 'react';
import { UserPlus, Users, Clock, Search, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { useFriendsStore, Friend, FriendRequest } from '../store/friendsStore';

function getInitials(f: Friend | FriendRequest) {
  const name = ('displayName' in f && f.displayName) ? f.displayName : f.username;
  return String(name || 'U')[0].toUpperCase();
}

function getTopGenres(f: Friend): string[] {
  if (!f.tasteProfile?.genreVector) return [];
  return Object.keys(f.tasteProfile.genreVector).slice(0, 3);
}

export default function FriendsPage() {
  const { friends, requests, isLoading, fetchFriends, fetchRequests, sendRequest, acceptRequest, removeFriend } = useFriendsStore();
  const [tab, setTab] = useState<'friends' | 'requests' | 'find'>('friends');
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<{ username: string; uniqueId: string } | null>(null);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => { fetchFriends(); fetchRequests(); }, []);

  const handleSendRequest = async () => {
    if (!searchId.trim()) return;
    setSearchStatus('loading');
    setSearchError(null);
    try {
      const result = await sendRequest(searchId.trim().toUpperCase());
      setSearchResult(result);
      setSearchStatus('sent');
    } catch (err: unknown) {
      setSearchError((err as {response?:{data?:{error?:string}}}).response?.data?.error || 'Failed to send request');
      setSearchStatus('error');
    }
  };

  return (
    <Layout>
      <div className="page-content page-enter">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, flex: 1 }}>
            <Users size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-primary-light)' }} />
            Friends
          </h1>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ maxWidth: '380px', marginBottom: '28px' }}>
          <button className={`tab${tab === 'friends' ? ' active' : ''}`} onClick={() => setTab('friends')}>
            My Friends ({friends.length})
          </button>
          <button className={`tab${tab === 'requests' ? ' active' : ''}`} onClick={() => setTab('requests')}>
            Requests {requests.length > 0 && <span style={{ background: 'var(--color-error)', color: '#fff', borderRadius: '99px', padding: '1px 6px', fontSize: '0.7rem', marginLeft: '4px' }}>{requests.length}</span>}
          </button>
          <button className={`tab${tab === 'find' ? ' active' : ''}`} onClick={() => setTab('find')}>
            <Search size={13} /> Find
          </button>
        </div>

        {/* My Friends */}
        {tab === 'friends' && (
          isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '80px' }} />)}
            </div>
          ) : friends.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-title">No friends yet</div>
                <div className="empty-state-desc">Find friends by their unique FlickFuse ID and start discovering what they watch.</div>
                <button onClick={() => setTab('find')} className="btn btn-primary" style={{ marginTop: '8px' }}>
                  <UserPlus size={16} /> Find Friends
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {friends.map((f) => (
                <div key={f.friendshipId} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                  <div className="avatar avatar-md">{getInitials(f)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>{f.displayName || f.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)', fontFamily: 'monospace' }}>{f.uniqueId}</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {getTopGenres(f).map(g => <span key={g} className="badge badge-genre" style={{ fontSize: '0.7rem' }}>{g}</span>)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-danger btn-sm" onClick={() => removeFriend(f.friendshipId)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Requests */}
        {tab === 'requests' && (
          requests.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📬</div>
                <div className="empty-state-title">No pending requests</div>
                <div className="empty-state-desc">When someone sends you a friend request, it'll appear here.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.map((req) => (
                <div key={req.requestId} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                  <div className="avatar avatar-md">{getInitials(req)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>{req.displayName || req.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)', fontFamily: 'monospace' }}>{req.uniqueId}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '2px' }}>
                      <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      {new Date(req.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => acceptRequest(req.requestId)} className="btn btn-primary btn-sm">
                      <CheckCircle size={14} /> Accept
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }}>
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Find Friends */}
        {tab === 'find' && (
          <div className="card" style={{ maxWidth: '480px' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '8px' }}>Find by Unique ID</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
              Ask your friend for their FlickFuse ID (format: ABC-12345)
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <input
                className="input" placeholder="ABC-12345"
                value={searchId} onChange={(e) => { setSearchId(e.target.value.toUpperCase()); setSearchStatus('idle'); setSearchResult(null); }}
                style={{ fontFamily: "'Roboto Mono', monospace", letterSpacing: '0.1em', flex: 1 }}
                maxLength={9}
              />
              <button className="btn btn-primary" onClick={handleSendRequest} disabled={searchId.length < 6 || searchStatus === 'loading'}>
                {searchStatus === 'loading' ? '…' : <><UserPlus size={15} /> Send</>}
              </button>
            </div>

            {searchStatus === 'error' && (
              <div className="alert alert-error">{searchError}</div>
            )}

            {searchStatus === 'sent' && searchResult && (
              <div className="alert alert-success">
                <CheckCircle size={16} />
                Friend request sent to <strong>{searchResult.username}</strong> ({searchResult.uniqueId})! 🎉
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
