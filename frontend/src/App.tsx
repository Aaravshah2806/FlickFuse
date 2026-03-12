import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage         from './pages/LandingPage';
import LoginPage           from './pages/LoginPage';
import SignupPage          from './pages/SignupPage';
import DashboardPage       from './pages/DashboardPage';
import ImportPage          from './pages/ImportPage';
import RecommendationsPage from './pages/RecommendationsPage';
import FriendsPage         from './pages/FriendsPage';
import ListsPage           from './pages/ListsPage';
import SettingsPage        from './pages/SettingsPage';

function App() {
  const { isSignedIn, getToken, userId } = useAuth();
  const { syncFromClerk, clearUser } = useAuthStore();

  // Sync Clerk auth state with our backend
  useEffect(() => {
    if (isSignedIn && userId) {
      registerTokenProvider(getToken);
      syncFromClerk(userId, getToken);
    } else if (isSignedIn === false) {
      clearUser();
    }
  }, [isSignedIn, userId, getToken]);

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/"       element={<LandingPage />} />
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/login/*"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/*" element={<SignupPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/import" element={
          <ProtectedRoute><ImportPage /></ProtectedRoute>
        } />
        <Route path="/recommendations" element={
          <ProtectedRoute><RecommendationsPage /></ProtectedRoute>
        } />
        <Route path="/friends" element={
          <ProtectedRoute><FriendsPage /></ProtectedRoute>
        } />
        <Route path="/lists" element={
          <ProtectedRoute><ListsPage /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><SettingsPage /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
