import { useState, useEffect } from 'react';
import { Save, User, Shield, Copy, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

type SettingsTab = 'profile' | 'privacy';

export default function SettingsPage() {
  const { user, loadFromStorage } = useAuthStore();
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
      // Refresh user in storage
      const { data } = await api.get('/api/auth/me');
      localStorage.setItem('ss_user', JSON.stringify(data));
      loadFromStorage();
      setProfileMsg({ type: 'success', text: 'Profile saved successfully!' });
    } catch (err: unknown) {
      setProfileMsg({ type: 'error', text: (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Save failed' });
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px' }}>Settings</h1>

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
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Unique ID */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)' }}>
              <div className="avatar avatar-xl">{(user?.displayName || user?.username || 'U')[0].toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{user?.displayName || user?.username}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>@{user?.username}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: "'Roboto Mono', monospace", color: 'var(--color-primary-light)', fontWeight: 700 }}>
                    {user?.uniqueId}
                  </span>
                  <button onClick={copyUniqueId} className="btn btn-ghost btn-sm" title="Copy ID">
                    {copiedId ? <CheckCircle size={14} color="var(--color-success)" /> : <Copy size={14} />}
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
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }}>@</span>
                <input className="input" placeholder="username" value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())} style={{ paddingLeft: '28px' }} maxLength={30} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="input" placeholder="Tell people about your taste…" value={bio}
                onChange={(e) => setBio(e.target.value)} style={{ resize: 'vertical', minHeight: '100px' }} maxLength={500} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', textAlign: 'right' }}>{bio.length}/500</span>
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
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {privacyMsg && (
              <div className={`alert alert-${privacyMsg.type}`}>{privacyMsg.text}</div>
            )}

            {[
              {
                label: 'Profile Visibility',
                desc: 'Control who can see your profile',
                value: profileVisibility,
                setter: setProfileVisibility,
                options: [{ v: 'public', l: '🌐 Public' }, { v: 'friends', l: '👥 Friends Only' }, { v: 'private', l: '🔒 Private' }],
              },
              {
                label: 'Taste Profile Sharing',
                desc: 'Who can see your viewing tastes',
                value: tasteSharing,
                setter: setTasteSharing,
                options: [{ v: 'all_friends', l: '👥 All Friends' }, { v: 'nobody', l: '🔒 Nobody' }],
              },
            ].map(({ label, desc, value, setter, options }) => (
              <div key={label}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>{desc}</div>
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
              { label: 'Show Recent Activity', desc: 'Let friends see your recent watches', value: activityVisible, setter: setActivityVisible },
              { label: 'Share Recommendations', desc: 'Friends can see your AI recommendations', value: recSharing, setter: setRecSharing },
            ].map(({ label, desc, value, setter }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{desc}</div>
                </div>
                <button onClick={() => setter(!value)}
                  style={{
                    width: 48, height: 28, borderRadius: 'var(--radius-full)',
                    background: value ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                    border: '1px solid', borderColor: value ? 'var(--color-primary-dark)' : 'var(--color-border)',
                    position: 'relative', cursor: 'pointer', transition: 'all var(--transition-fast)', flexShrink: 0,
                  }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '50%', transform: `translate(${value ? '22px' : '2px'}, -50%)`,
                    transition: 'transform var(--transition-fast)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
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
