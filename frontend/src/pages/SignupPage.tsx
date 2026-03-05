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

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(6,182,212,0.1) 0%, transparent 70%)',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✨</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>Create your account</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Join FlickFuse — free forever
          </p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>⚠ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} />
                <input type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: '40px' }} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} />
                <input type="text" className="input" placeholder="cooluser123"
                  value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  style={{ paddingLeft: '40px' }} required minLength={3} maxLength={30}
                  pattern="[a-zA-Z0-9_]+" title="Letters, numbers and underscores only" />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>Letters, numbers and underscores only</span>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)' }} />
                <input type={showPass ? 'text' : 'password'} className="input" placeholder="Min. 8 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px', paddingRight: '44px' }} required minLength={8} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-faint)', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password && (
                <div className="progress-bar" style={{ marginTop: 6 }}>
                  <div className="progress-fill" style={{ width: `${Math.min(100, password.length * 10)}%`,
                    background: password.length < 8 ? 'var(--color-error)' : password.length < 12 ? 'var(--color-warning)' : 'var(--color-success)' }} />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? 'Creating account…' : <><UserPlus size={17} /> Create Account</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '24px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--color-text-faint)', fontSize: '0.75rem', marginTop: '16px' }}>
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
