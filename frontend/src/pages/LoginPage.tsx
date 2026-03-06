import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch { /* error shown in state */ }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
      background: `
        radial-gradient(ellipse 600px 400px at 50% 0%, rgba(0,255,159,0.06) 0%, transparent 70%),
        radial-gradient(ellipse 400px 300px at 80% 80%, rgba(0,212,255,0.04) 0%, transparent 70%),
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #00FF9F, #00D4FF)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 16px rgba(0,255,159,0.3))',
            marginBottom: '24px',
          }}>⚡ FlickFuse</div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: '1.75rem',
            fontWeight: 800, marginBottom: '8px', letterSpacing: '-1px',
          }}>Welcome back</h1>
          <p style={{
            color: '#8888AA', fontSize: '0.85rem',
            fontFamily: "'DM Mono', monospace",
          }}>
            // sign in to your account
          </p>
        </div>

        <div className="card" style={{
          border: '1px solid rgba(0,255,159,0.1)',
          boxShadow: '0 0 40px rgba(0,255,159,0.04), 0 24px 48px rgba(0,0,0,0.4)',
        }}>
          {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>⚠ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#3A3A52' }} />
                <input
                  type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }} required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#3A3A52' }} />
                <input
                  type={showPass ? 'text' : 'password'} className="input" placeholder="Your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px', paddingRight: '44px' }} required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#3A3A52', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? 'Signing in…' : <><LogIn size={17} /> Sign In</>}
            </button>
          </form>

          <div className="divider-text" style={{ margin: '24px 0' }}>or</div>

          <p style={{ textAlign: 'center', color: '#8888AA', fontSize: '0.85rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#00FF9F', fontWeight: 600, textShadow: '0 0 8px rgba(0,255,159,0.3)' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
