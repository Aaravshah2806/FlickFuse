import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Sparkles, Users, BookMarked, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <NavLink to="/dashboard" className="navbar-brand">🎬 FlickFuse</NavLink>

        <div className="navbar-links">
          <NavLink to="/dashboard"       className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            <Home size={16} /> Home
          </NavLink>
          <NavLink to="/recommendations" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            <Sparkles size={16} /> Recommendations
          </NavLink>
          <NavLink to="/friends"         className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            <Users size={16} /> Friends
          </NavLink>
          <NavLink to="/lists"           className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
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
              <NavLink to="/login"  className="btn btn-ghost btn-sm"><User size={15}/> Login</NavLink>
              <NavLink to="/signup" className="btn btn-primary btn-sm">Get Started</NavLink>
            </>
          )}
        </div>
      </nav>

      <main className="page">
        {children}
      </main>
    </>
  );
}
