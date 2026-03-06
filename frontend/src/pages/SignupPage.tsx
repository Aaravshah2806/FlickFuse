import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register(email, password, username);
      navigate('/dashboard');
    } catch { /* error shown in state */ }
  };

  const strengthColor = password.length < 8 ? '#FF453A' : password.length < 12 ? '#FFD60A' : '#00FF9F';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
      background: `
        radial-gradient(ellipse 600px 400px at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 70%),
        radial-gradient(ellipse 400px 300px at 20% 80%, rgba(191,90,242,0.04) 0%, transparent 70%),
        #02000D
      `,
    }}>
      {/* Film grain */}
      <div className="grain-overlay" />

      {/* Scanline */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.02,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #00D4FF, #BF5AF2)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 16px rgba(0,212,255,0.3))',
            marginBottom: '24px',
          }}>⚡ FlickFuse</div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: '1.75rem',
            fontWeight: 800, marginBottom: '8px', letterSpacing: '-1px',
          }}>Create your account</h1>
          <p style={{
            color: '#8888AA', fontSize: '0.85rem',
            fontFamily: "'DM Mono', monospace",
          }}>
            // join FlickFuse — free forever
          </p>
        </div>

        <div className="card" style={{
          border: '1px solid rgba(0,212,255,0.1)',
          boxShadow: '0 0 40px rgba(0,212,255,0.04), 0 24px 48px rgba(0,0,0,0.4)',
        }}>
          {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>⚠ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#3A3A52' }} />
                <input type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: '40px' }} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#3A3A52' }} />
                <input type="text" className="input" placeholder="cooluser123"
                  value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  style={{ paddingLeft: '40px' }} required minLength={3} maxLength={30}
                  pattern="[a-zA-Z0-9_]+" title="Letters, numbers and underscores only" />
              </div>
              <span style={{
                fontSize: '0.7rem', color: '#3A3A52',
                fontFamily: "'Space Mono', monospace",
              }}>// letters, numbers and underscores only</span>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#3A3A52' }} />
                <input type={showPass ? 'text' : 'password'} className="input" placeholder="Min. 8 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px', paddingRight: '44px' }} required minLength={8} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#3A3A52', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="progress-bar" style={{ marginTop: 6 }}>
                  <div className="progress-fill" style={{
                    width: `${Math.min(100, password.length * 10)}%`,
                    background: `linear-gradient(90deg, ${strengthColor}, ${strengthColor})`,
                    boxShadow: `0 0 12px ${strengthColor}40`,
                  }} />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? 'Creating account…' : <><UserPlus size={17} /> Create Account</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#8888AA', fontSize: '0.85rem', marginTop: '24px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#00D4FF', fontWeight: 600, textShadow: '0 0 8px rgba(0,212,255,0.3)' }}>Sign in</Link>
          </p>
        </div>

        <p style={{
          textAlign: 'center', color: '#3A3A52', fontSize: '0.7rem', marginTop: '16px',
          fontFamily: "'Space Mono', monospace",
        }}>
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
