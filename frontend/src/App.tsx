import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import ProfileEdit from './pages/ProfileEdit';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import ContentDetail from './pages/ContentDetail';
import SearchResults from './pages/SearchResults';
import Discover from './pages/Discover';
import Import from './pages/Import';
import Friends from './pages/Friends';
import Lists from './pages/Lists';
import History from './pages/History';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2563EB] border-t-transparent"></div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isConfigured } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Setup Required</h2>
          <p className="text-gray-600 mb-4">
            Configure Supabase in your .env file to access the app.
          </p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isConfigured } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (user && isConfigured) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/content/:type/:id" element={<ProtectedRoute><AppLayout><ContentDetail /></AppLayout></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><AppLayout><SearchResults /></AppLayout></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><AppLayout><Discover /></AppLayout></ProtectedRoute>} />
        <Route path="/import" element={<ProtectedRoute><AppLayout><Import /></AppLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
        <Route path="/settings/profile" element={<ProtectedRoute><AppLayout><ProfileEdit /></AppLayout></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><AppLayout><Friends /></AppLayout></ProtectedRoute>} />
        <Route path="/lists" element={<ProtectedRoute><AppLayout><Lists /></AppLayout></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><AppLayout><History /></AppLayout></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
