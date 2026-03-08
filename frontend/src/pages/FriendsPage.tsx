import { useState, useEffect } from 'react';
import { UserPlus, Users, Clock, Search, CheckCircle, XCircle, Activity, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import { useFriendsStore, Friend, FeedEvent } from '../store/friendsStore';
import { useRecommendationsStore } from '../store/recommendationsStore';

function getInitials(f: { username: string; displayName?: string }) {
  const name = f.displayName || f.username;
  return String(name || 'U')[0].toUpperCase();
}

function getTopGenres(f: Friend): string[] {
  if (!f.tasteProfile?.genreVector) return [];
  return Object.keys(f.tasteProfile.genreVector).slice(0, 3);
}

export default function FriendsPage() {
  const { friends, requests, feed, isLoading, fetchFriends, fetchRequests, fetchFeed, sendRequest, acceptRequest, removeFriend } = useFriendsStore();
  const { recommendations, isLoading: recsLoading, groupGenerate } = useRecommendationsStore();
  
  const [tab, setTab] = useState<'feed' | 'friends' | 'requests' | 'find'>('feed');
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<{ username: string; uniqueId: string } | null>(null);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  useEffect(() => { fetchFriends(); fetchRequests(); fetchFeed(); }, []);

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
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '1.75rem', fontWeight: 700, flex: 1,
            letterSpacing: '-0.5px',
          }}>
            <Users size={22} style={{
              display: 'inline', verticalAlign: 'middle', marginRight: '8px',
              color: '#BF5AF2', filter: 'drop-shadow(0 0 8px rgba(191,90,242,0.4))',
            }} />
            Friends
          </h1>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ maxWidth: '480px', marginBottom: '28px' }}>
          <button className={`tab${tab === 'feed' ? ' active' : ''}`} onClick={() => setTab('feed')}>
            <Activity size={13} /> Feed
          </button>
          <button className={`tab${tab === 'friends' ? ' active' : ''}`} onClick={() => setTab('friends')}>
            My Friends ({friends.length})
          </button>
          <button className={`tab${tab === 'requests' ? ' active' : ''}`} onClick={() => setTab('requests')}>
            Requests {requests.length > 0 && <span style={{
              background: '#FF453A', color: '#fff', borderRadius: '99px',
              padding: '1px 6px', fontSize: '0.65rem', marginLeft: '4px',
              boxShadow: '0 0 8px rgba(255,69,58,0.4)',
            }}>{requests.length}</span>}
          </button>
          <button className={`tab${tab === 'find' ? ' active' : ''}`} onClick={() => setTab('find')}>
            <Search size={13} /> Find
          </button>
        </div>

        {/* Feed Tab */}
        {tab === 'feed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {feed.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">🤫</div>
                  <div className="empty-state-title">Quiet out here...</div>
                  <div className="empty-state-desc">When your friends watch something and react to it, it will show up here spoiler-free!</div>
                </div>
              </div>
            ) : (
              feed.map((event: FeedEvent) => (
                <div key={event.id} className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #BF5AF2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div className="avatar avatar-sm">{getInitials(event.friend)}</div>
                    <div>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{event.friend.displayName || event.friend.username}</span>
                      <span style={{ color: '#8888AA', fontSize: '0.82rem', marginLeft: '6px' }}>just finished</span>
                    </div>
                  </div>
                  <div style={{ paddingLeft: '44px' }}>
                    <div style={{ fontFamily: "'Space Mono', monospace", color: '#00FF9F', marginBottom: '8px' }}>
                      "{event.title}" &nbsp;({event.platform})
                    </div>
                    <p style={{ color: '#EAEAEA', fontSize: '0.9rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {event.reaction}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    groupGenerate(friends.map(f => f.friendId));
                    setShowGroupModal(true);
                  }}
                >
                  <Sparkles size={16} /> Find Common Ground
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {friends.map((f) => (
                <div key={f.friendshipId} className="card" style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
                }}>
                  <div className="avatar avatar-md">{getInitials(f)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '2px' }}>{f.displayName || f.username}</div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.75rem', color: '#00FF9F',
                      textShadow: '0 0 6px rgba(0,255,159,0.2)',
                    }}>{f.uniqueId}</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {getTopGenres(f).map(g => <span key={g} className="badge badge-genre">{g}</span>)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-danger btn-sm" onClick={() => removeFriend(f.friendshipId)}>Remove</button>
                  </div>
                </div>
              ))}
              </div>
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
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '2px' }}>{req.displayName || req.username}</div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.75rem', color: '#00D4FF',
                    }}>{req.uniqueId}</div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.7rem', color: '#3A3A52', marginTop: '2px',
                    }}>
                      <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      {new Date(req.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => acceptRequest(req.requestId)} className="btn btn-primary btn-sm">
                      <CheckCircle size={14} /> Accept
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ color: '#FF453A' }}>
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
          <div className="card" style={{
            maxWidth: '480px',
            border: '1px solid rgba(191,90,242,0.12)',
          }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px',
            }}>Find by Unique ID</h2>
            <p style={{ color: '#8888AA', fontSize: '0.82rem', marginBottom: '20px' }}>
              // ask your friend for their FlickFuse ID (format: ABC-12345)
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <input
                className="input" placeholder="ABC-12345"
                value={searchId} onChange={(e) => { setSearchId(e.target.value.toUpperCase()); setSearchStatus('idle'); setSearchResult(null); }}
                style={{
                  fontFamily: "'Space Mono', monospace", letterSpacing: '0.15em', flex: 1,
                }}
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
                Friend request sent to <strong>{searchResult.username}</strong> ({searchResult.uniqueId})! ⚡
              </div>
            )}
          </div>
        )}

        {/* Group Info Modal */}
        {showGroupModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowGroupModal(false)}>
            <div className="modal" style={{ maxWidth: '600px', width: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Watch Together Picks 🍿</h2>
                <button onClick={() => setShowGroupModal(false)} className="btn btn-ghost btn-sm"><XCircle size={18} /></button>
              </div>
              {recsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8888AA' }}>Finding common ground...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recommendations.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#8888AA' }}>No common shows found. Try importing more history!</div>
                  ) : (
                    recommendations.map((rec) => (
                      <div key={rec.id || rec.title} className="card" style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                        <div>
                          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.05rem', fontWeight: 700 }}>{rec.title}</div>
                          <div style={{ fontSize: '0.82rem', color: '#8888AA', marginTop: '6px' }}>{rec.reason}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
