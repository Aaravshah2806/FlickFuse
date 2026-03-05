import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Star, Users, Shield, ArrowRight, CheckCircle, Import } from 'lucide-react';

const PLATFORM_LOGOS = ['🎬 Netflix', '📦 Prime Video', '⭐ Hotstar', '🍎 Apple TV+'];

const FEATURES = [
  { icon: '🔗', title: 'Unified Watch History', desc: 'All your Netflix, Prime, Hotstar history in one place.' },
  { icon: '🤖', title: 'AI Recommendations', desc: 'Cross-platform taste profile with smart AI matching.' },
  { icon: '🔒', title: 'Privacy-First', desc: 'Your data stays yours. No streaming-account login required.' },
  { icon: '👥', title: 'Social Discovery', desc: 'Find what friends are watching without exposing raw history.' },
];

const STEPS = [
  { icon: <Import size={28} color="var(--color-primary-light)" />, title: 'Import Your History', desc: 'Upload a CSV from Netflix, Prime Video, or Hotstar — takes 30 seconds.' },
  { icon: <Star size={28} color="var(--color-accent)" />, title: 'Get AI Recommendations', desc: 'Our engine builds your taste profile and finds hidden gems across all platforms.' },
  { icon: <Users size={28} color="var(--color-success)" />, title: 'Share With Friends', desc: 'Connect via unique ID and discover what your friends love — privately.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentPlatform, setCurrentPlatform] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentPlatform((p) => (p + 1) % PLATFORM_LOGOS.length), 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar-brand">🎬 FlickFuse</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <Link to="/login"  className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '90vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '80px 24px 40px',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 'var(--radius-full)', padding: '6px 16px',
          fontSize: '0.8rem', color: 'var(--color-primary-light)', marginBottom: '32px',
          fontWeight: 600,
        }}>
          <Play size={12} fill="currentColor" /> Now supporting {PLATFORM_LOGOS[currentPlatform]}
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1,
          marginBottom: '24px', maxWidth: '800px',
          background: 'linear-gradient(135deg, #f1f5f9 30%, var(--color-primary-light))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Your Streaming Taste,<br />Finally Unified
        </h1>

        <p style={{
          fontSize: '1.15rem', color: 'var(--color-text-muted)', maxWidth: '600px',
          marginBottom: '40px', lineHeight: 1.8,
        }}>
          Aggregate your watch history from Netflix, Prime Video, and Hotstar.
          Get AI-powered cross-platform recommendations and share with friends — privately.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/signup')} className="btn btn-primary btn-lg">
            Get Started Free <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/login')} className="btn btn-secondary btn-lg">
            Sign In
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', marginTop: '48px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['No API access needed', 'Privacy-first design', 'Free to use'].map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              <CheckCircle size={16} color="var(--color-success)" /> {t}
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '16px' }}>How It Works</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '56px' }}>
          Three steps to your unified streaming experience
        </p>
        <div className="grid-3">
          {STEPS.map((step, i) => (
            <div key={i} className="card card-hover" style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 'var(--radius-xl)',
                background: 'var(--color-bg-elevated)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                border: '1px solid var(--color-border)',
              }}>
                {step.icon}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.1em' }}>
                STEP {i + 1}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>{step.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 24px', background: 'rgba(99,102,241,0.03)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '16px' }}>Why FlickFuse?</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '56px' }}>
            Built different from every streaming aggregator out there
          </p>
          <div className="grid-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '2rem', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.1))',
        borderTop: '1px solid var(--color-border)',
      }}>
        <Shield size={40} color="var(--color-primary-light)" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px' }}>
          Your data stays yours
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
          We never ask for your Netflix or Prime password. You export, you upload, you own it.
        </p>
        <button onClick={() => navigate('/signup')} className="btn btn-primary btn-lg">
          Start for Free <ArrowRight size={18} />
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--color-border)', padding: '32px 24px',
        textAlign: 'center', color: 'var(--color-text-faint)', fontSize: '0.85rem',
      }}>
        <p>© 2026 FlickFuse · Built with ❤️ for multi-platform streamers</p>
      </footer>
    </div>
  );
}
