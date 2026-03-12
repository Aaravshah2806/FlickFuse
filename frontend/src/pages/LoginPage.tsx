import { SignIn } from '@clerk/clerk-react';

export default function LoginPage() {
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

      <div style={{ position: 'relative', zIndex: 1 }}>
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/signup"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: { width: '100%', maxWidth: '440px' },
              card: {
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(0,255,159,0.1)',
                boxShadow: '0 0 40px rgba(0,255,159,0.04), 0 24px 48px rgba(0,0,0,0.4)',
                borderRadius: '16px',
                backdropFilter: 'blur(20px)',
              },
              headerTitle: {
                fontFamily: "'Syne', sans-serif",
                color: '#EEEEF0',
              },
              headerSubtitle: {
                color: '#8888AA',
                fontFamily: "'DM Mono', monospace",
              },
              formFieldInput: {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#EEEEF0',
                borderRadius: '10px',
              },
              formButtonPrimary: {
                background: 'linear-gradient(135deg, #00FF9F, #00D4FF)',
                color: '#02000D',
                fontWeight: '700',
                borderRadius: '10px',
              },
              footerActionLink: {
                color: '#00FF9F',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
