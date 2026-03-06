import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Sparkles, Users, BookMarked, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useEffect, useRef } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

  // Scroll velocity blur
  useEffect(() => {
    let lastScroll = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const velocity = Math.abs(window.scrollY - lastScroll);
          const blur = Math.min(velocity * 0.06, 3);
          document.documentElement.style.setProperty('--scroll-blur', `${blur}px`);
          lastScroll = window.scrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Film Grain Overlay */}
      <div className="grain-overlay" />

      <nav className="navbar">
        <NavLink to="/dashboard" className="navbar-brand">⚡ FlickFuse</NavLink>

        <div className="navbar-links">
          <NavLink to="/dashboard" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            <Home size={16} /> Home
          </NavLink>
          <NavLink to="/recommendations" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            <Sparkles size={16} /> Recs
          </NavLink>
          <NavLink to="/friends" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            <Users size={16} /> Friends
          </NavLink>
          <NavLink to="/lists" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            <BookMarked size={16} /> Lists
          </NavLink>
        </div>

        <div className="navbar-actions">
          {user && (
            <>
              <NavLink to="/settings" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
                <div className="avatar avatar-sm">{(user.displayName || user.username || 'U')[0].toUpperCase()}</div>
              </NavLink>
              <button className="navbar-link" onClick={handleLogout} title="Logout">
                <LogOut size={15} />
              </button>
            </>
          )}
          {!user && (
            <>
              <NavLink to="/login" className="btn btn-ghost btn-sm"><User size={15}/> Login</NavLink>
              <NavLink to="/signup" className="btn btn-primary btn-sm">Get Started</NavLink>
            </>
          )}
        </div>
      </nav>

      <main className="page" ref={mainRef}>
        {children}
      </main>
    </>
  );
}
