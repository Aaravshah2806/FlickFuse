import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

const PLATFORM_LOGOS = ['🎬 Netflix', '📦 Prime Video', '⭐ Hotstar', '🍎 Apple TV+'];

const FEATURES = [
  { icon: '🔗', title: 'Unified Watch History', desc: 'All your Netflix, Prime, Hotstar history in one place.', neon: '#00FF9F' },
  { icon: '🤖', title: 'AI Recommendations', desc: 'Cross-platform taste profile with smart AI matching.', neon: '#00D4FF' },
  { icon: '🔒', title: 'Privacy-First', desc: 'Your data stays yours. No streaming-account login required.', neon: '#BF5AF2' },
  { icon: '👥', title: 'Social Discovery', desc: 'Find what friends are watching without exposing raw history.', neon: '#FF2D78' },
];

const STEPS = [
  { num: '01', title: 'Import Your History', desc: 'Upload a CSV from Netflix, Prime Video, or Hotstar — takes 30 seconds.', neon: '#00FF9F' },
  { num: '02', title: 'Get AI Recommendations', desc: 'Our engine builds your taste profile and finds hidden gems across all platforms.', neon: '#00D4FF' },
  { num: '03', title: 'Share With Friends', desc: 'Connect via unique ID and discover what your friends love — privately.', neon: '#BF5AF2' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentPlatform, setCurrentPlatform] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentPlatform((p) => (p + 1) % PLATFORM_LOGOS.length), 2000);
    return () => clearInterval(timer);
  }, []);

  // Spotlight cursor effect on hero
  const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--cx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--cy', `${e.clientY - rect.top}px`);
  }, []);

  // Magnetic button effect
  const handleMagneticMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) * 0.2;
    const dy = (e.clientY - cy) * 0.2;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
    btn.style.transition = 'transform 0.1s';
  }, []);

  const handleMagneticLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    btn.style.transform = 'translate(0, 0)';
    btn.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll('[data-reveal]');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', background: '#02000D' }}>
      {/* Film Grain Overlay */}
      <div className="grain-overlay" />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar-brand">⚡ FlickFuse</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '120px 48px 80px',
          position: 'relative', overflow: 'hidden',
          background: `
            radial-gradient(800px circle at var(--cx, 50%) var(--cy, 50%), rgba(0,255,159,0.04), transparent 40%),
            radial-gradient(ellipse 800px 500px at 20% 50%, rgba(0,255,159,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 600px 400px at 80% 30%, rgba(0,212,255,0.06) 0%, transparent 70%),
            #02000D
          `,
        }}
      >
        {/* Scanline overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
        }} />

        {/* Platform pill */}
        <div data-reveal style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(0,255,159,0.06)', border: '1px solid rgba(0,255,159,0.2)',
          borderRadius: '9999px', padding: '8px 20px',
          fontFamily: "'Space Mono', monospace", fontSize: '0.75rem',
          color: '#00FF9F', marginBottom: '40px', letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF9F', boxShadow: '0 0 8px #00FF9F' }} />
          Now supporting {PLATFORM_LOGOS[currentPlatform]}
        </div>

        {/* Hero headline */}
        <h1 data-reveal style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 'clamp(48px, 10vw, 112px)', lineHeight: 0.9,
          letterSpacing: '-4px', textTransform: 'uppercase',
          marginBottom: '32px', maxWidth: '900px',
          color: '#E0E0F0',
        }}>
          YOUR{' '}
          <span style={{
            background: 'linear-gradient(135deg, #00FF9F, #00D4FF)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(0,255,159,0.4))',
          }}>STREAMING</span>
          <br />TASTE,<br />UNIFIED
        </h1>

        {/* Hero sub */}
        <p data-reveal style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.9rem',
          color: '#8888AA', maxWidth: '520px', lineHeight: 1.8,
          marginBottom: '48px',
        }}>
          // aggregate your watch history from Netflix, Prime Video, and Hotstar.
          Get AI-powered cross-platform recommendations and share with friends — privately.
        </p>

        {/* CTA Buttons with magnetic effect */}
        <div data-reveal style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/signup')}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            className="btn btn-primary btn-lg"
          >
            Get Started Free <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/login')}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            className="btn btn-secondary btn-lg"
            style={{ border: '1px solid rgba(0,255,159,0.2)' }}
          >
            Sign In
          </button>
        </div>

        {/* Trust indicators */}
        <div data-reveal style={{ display: 'flex', gap: '32px', marginTop: '56px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['No API access needed', 'Privacy-first design', 'Free to use'].map((t) => (
            <div key={t} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: '#8888AA', fontSize: '0.8rem',
              fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.5px',
            }}>
              <CheckCircle size={14} color="#30D158" /> {t}
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{
        padding: '100px 48px', maxWidth: '1200px', margin: '0 auto',
        position: 'relative',
      }}>
        <div data-reveal style={{
          fontFamily: "'Space Mono', monospace", fontSize: '11px',
          letterSpacing: '3px', textTransform: 'uppercase',
          color: '#8888AA', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          How It Works
          <span style={{ flex: 1, maxWidth: 60, height: 1, background: '#3A3A52' }} />
        </div>

        <h2 data-reveal style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-2px',
          marginBottom: '60px', lineHeight: 1.05,
        }}>
          Three Steps To
          <br />
          <span style={{ color: '#00FF9F', textShadow: '0 0 20px rgba(0,255,159,0.3)' }}>Your Unified Feed</span>
        </h2>

        <div className="grid-3">
          {STEPS.map((step, i) => (
            <div key={i} data-reveal className="card card-hover" style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '2rem', fontWeight: 700,
                color: step.neon, opacity: 0.3,
                marginBottom: '16px',
                textShadow: `0 0 20px ${step.neon}40`,
              }}>{step.num}</div>
              <h3 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '1.1rem', fontWeight: 700,
                marginBottom: '12px', letterSpacing: '-0.5px',
              }}>{step.title}</h3>
              <p style={{
                color: '#8888AA', fontSize: '0.85rem', lineHeight: 1.7,
              }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{
        height: 1, margin: '0 48px',
        background: 'linear-gradient(90deg, transparent, rgba(0,255,159,0.12), transparent)',
      }} />

      {/* ── Features ── */}
      <section style={{
        padding: '100px 48px',
        background: 'linear-gradient(180deg, transparent, rgba(0,255,159,0.02), transparent)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div data-reveal style={{
            fontFamily: "'Space Mono', monospace", fontSize: '11px',
            letterSpacing: '3px', textTransform: 'uppercase',
            color: '#8888AA', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            Why FlickFuse
            <span style={{ flex: 1, maxWidth: 60, height: 1, background: '#3A3A52' }} />
          </div>

          <h2 data-reveal style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-2px',
            marginBottom: '60px', lineHeight: 1.05,
          }}>
            Built Different
          </h2>

          <div className="grid-2">
            {FEATURES.map((f) => (
              <div key={f.title} data-reveal className="card" style={{
                display: 'flex', gap: '20px', alignItems: 'flex-start',
                borderColor: 'rgba(255,255,255,0.04)',
                transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${f.neon}30`;
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${f.neon}10`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '1.8rem', flexShrink: 0,
                  width: 52, height: 52,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '14px',
                  background: `${f.neon}10`,
                  border: `1px solid ${f.neon}25`,
                }}>{f.icon}</div>
                <div>
                  <h3 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px',
                  }}>{f.title}</h3>
                  <p style={{ color: '#8888AA', fontSize: '0.85rem', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{
        height: 1, margin: '0 48px',
        background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.12), transparent)',
      }} />

      {/* ── CTA Banner ── */}
      <section data-reveal style={{
        padding: '100px 48px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 600px 400px at 50% 50%, rgba(0,255,159,0.06), transparent 70%)',
        }} />

        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: '11px',
          letterSpacing: '3px', textTransform: 'uppercase',
          color: '#00FF9F', marginBottom: '24px',
        }}>
          // YOUR DATA STAYS YOURS
        </div>

        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-2px',
          marginBottom: '20px', lineHeight: 1.05,
        }}>
          Privacy By Design
        </h2>

        <p style={{
          color: '#8888AA', marginBottom: '40px',
          maxWidth: '500px', margin: '0 auto 40px',
          fontSize: '0.9rem', lineHeight: 1.7,
        }}>
          We never ask for your Netflix or Prime password. You export, you upload, you own it.
        </p>

        <button
          onClick={() => navigate('/signup')}
          onMouseMove={handleMagneticMove}
          onMouseLeave={handleMagneticLeave}
          className="btn btn-primary btn-lg"
        >
          Start for Free <ArrowRight size={18} />
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.04)', padding: '40px 48px',
        textAlign: 'center', color: '#3A3A52',
        fontFamily: "'Space Mono', monospace", fontSize: '0.8rem',
        letterSpacing: '0.5px',
      }}>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: '1rem',
          fontWeight: 700, color: '#E0E0F0', marginBottom: '8px',
        }}>FlickFuse</div>
        <p>© 2026 FlickFuse · Built with ⚡ for multi-platform streamers</p>
      </footer>
    </div>
  );
}
