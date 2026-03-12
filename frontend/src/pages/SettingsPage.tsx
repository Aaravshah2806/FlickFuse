import { useState, useEffect } from 'react';
import { Save, User, Shield, Copy, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

type SettingsTab = 'profile' | 'privacy';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<SettingsTab>('profile');

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [username, setUsername] = useState(user?.username || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Privacy state
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [tasteSharing, setTasteSharing] = useState('all_friends');
  const [activityVisible, setActivityVisible] = useState(true);
  const [recSharing, setRecSharing] = useState(true);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyMsg, setPrivacyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setUsername(user.username || '');
    }
  }, [user]);

  useEffect(() => {
    if (user?.privacySettings) {
      const ps = user.privacySettings as Record<string, unknown>;
      setProfileVisibility((ps.profile_visibility as string) || 'public');
      setTasteSharing((ps.taste_profile_sharing as string) || 'all_friends');
      setActivityVisible((ps.activity_visibility as boolean) !== false);
      setRecSharing((ps.recommendation_sharing as boolean) !== false);
    }
  }, [user]);

  const copyUniqueId = () => {
    if (user?.uniqueId) {
      navigator.clipboard.writeText(user.uniqueId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await api.put('/api/users/profile', { displayName, bio, username });
      setProfileMsg({ type: 'success', text: 'Profile saved successfully!' });
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Save failed';
      setProfileMsg({ type: 'error', text: errMsg });
    } finally { setProfileSaving(false); }
  };

  const savePrivacy = async () => {
    setPrivacySaving(true);
    setPrivacyMsg(null);
    try {
      await api.put('/api/users/privacy', {
        profileVisibility, tasteProfileSharing: tasteSharing,
        activityVisibility: activityVisible, recommendationSharing: recSharing,
      });
      setPrivacyMsg({ type: 'success', text: 'Privacy settings saved!' });
    } catch {
      setPrivacyMsg({ type: 'error', text: 'Failed to save privacy settings' });
    } finally { setPrivacySaving(false); }
  };

  return (
    <Layout>
      <div className="page-content page-enter" style={{ maxWidth: '800px' }}>
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px',
          letterSpacing: '-0.5px',
        }}>Settings</h1>

        {/* Tabs */}
        <div className="tabs" style={{ maxWidth: '280px', marginBottom: '32px' }}>
          <button className={`tab${tab === 'profile' ? ' active' : ''}`} onClick={() => setTab('profile')}>
            <User size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Profile
          </button>
          <button className={`tab${tab === 'privacy' ? ' active' : ''}`} onClick={() => setTab('privacy')}>
            <Shield size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Privacy
          </button>
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="card" style={{
            display: 'flex', flexDirection: 'column', gap: '24px',
            border: '1px solid rgba(0,255,159,0.08)',
          }}>
            {/* Unique ID */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div className="avatar avatar-xl">{(user?.displayName || user?.username || 'U')[0].toUpperCase()}</div>
              <div>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px',
                }}>{user?.displayName || user?.username}</div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.75rem', color: '#8888AA', marginBottom: '8px',
                }}>@{user?.username}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    color: '#00FF9F', fontWeight: 700,
                    textShadow: '0 0 8px rgba(0,255,159,0.3)',
                  }}>
                    {user?.uniqueId}
                  </span>
                  <button onClick={copyUniqueId} className="btn btn-ghost btn-sm" title="Copy ID">
                    {copiedId ? <CheckCircle size={14} color="#30D158" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {profileMsg && (
              <div className={`alert alert-${profileMsg.type}`}>{profileMsg.text}</div>
            )}

            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input className="input" placeholder="Your display name" value={displayName}
                onChange={(e) => setDisplayName(e.target.value)} maxLength={100} />
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: '#00FF9F', fontFamily: "'Space Mono', monospace",
                }}>@</span>
                <input className="input" placeholder="username" value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())} style={{ paddingLeft: '28px' }} maxLength={30} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="input" placeholder="// tell people about your taste…" value={bio}
                onChange={(e) => setBio(e.target.value)} style={{ resize: 'vertical', minHeight: '100px' }} maxLength={500} />
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.7rem', color: '#3A3A52', textAlign: 'right',
              }}>{bio.length}/500</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={saveProfile} disabled={profileSaving}>
                <Save size={16} /> {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {tab === 'privacy' && (
          <div className="card" style={{
            display: 'flex', flexDirection: 'column', gap: '28px',
            border: '1px solid rgba(0,212,255,0.08)',
          }}>
            {privacyMsg && (
              <div className={`alert alert-${privacyMsg.type}`}>{privacyMsg.text}</div>
            )}

            {[
              {
                label: 'Profile Visibility',
                desc: '// control who can see your profile',
                value: profileVisibility,
                setter: setProfileVisibility,
                options: [{ v: 'public', l: '🌐 Public' }, { v: 'friends', l: '👥 Friends Only' }, { v: 'private', l: '🔒 Private' }],
              },
              {
                label: 'Taste Profile Sharing',
                desc: '// who can see your viewing tastes',
                value: tasteSharing,
                setter: setTasteSharing,
                options: [{ v: 'all_friends', l: '👥 All Friends' }, { v: 'nobody', l: '🔒 Nobody' }],
              },
            ].map(({ label, desc, value, setter, options }) => (
              <div key={label}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: '#8888AA', marginBottom: '12px' }}>{desc}</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {options.map(({ v, l }) => (
                    <button key={v} onClick={() => setter(v)}
                      className={`btn btn-sm ${value === v ? 'btn-primary' : 'btn-secondary'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {[
              { label: 'Show Recent Activity', desc: '// let friends see your recent watches', value: activityVisible, setter: setActivityVisible },
              { label: 'Share Recommendations', desc: '// friends can see your AI recommendations', value: recSharing, setter: setRecSharing },
            ].map(({ label, desc, value, setter }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8888AA' }}>{desc}</div>
                </div>
                <button onClick={() => setter(!value)}
                  style={{
                    width: 48, height: 28, borderRadius: 'var(--radius-full)',
                    background: value ? 'linear-gradient(135deg, #00FF9F, #00D4FF)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid', borderColor: value ? 'rgba(0,255,159,0.3)' : 'rgba(255,255,255,0.08)',
                    position: 'relative', cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)', flexShrink: 0,
                    boxShadow: value ? '0 0 16px rgba(0,255,159,0.2)' : 'none',
                  }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: value ? '#02000D' : '#8888AA',
                    position: 'absolute', top: '50%', transform: `translate(${value ? '22px' : '2px'}, -50%)`,
                    transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }} />
                </button>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={savePrivacy} disabled={privacySaving}>
                <Save size={16} /> {privacySaving ? 'Saving…' : 'Save Privacy Settings'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
