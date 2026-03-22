import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Note: Account deletion should be handled by backend/supabase admin
      alert('Please contact support to delete your account.');
    }
  };

  const copyId = () => {
    if (profile?.unique_id) {
      navigator.clipboard.writeText(profile.unique_id);
      alert('ID copied to clipboard!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile Section */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Display Name</p>
              <p className="font-medium">{profile?.display_name || 'Not set'}</p>
            </div>
            <Link to="/settings/profile">
              <Button variant="secondary" size="sm">Edit</Button>
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Your ID</p>
              <p className="font-mono font-medium">{profile?.unique_id || '---'}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={copyId}>
              Copy
            </Button>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Privacy Section */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Profile Visibility</p>
              <p className="text-sm text-gray-500">Who can see your profile</p>
            </div>
            <Badge variant="default">
              {profile?.privacy_setting || 'friends'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Watch History</p>
              <p className="text-sm text-gray-500">Who can see your watch history</p>
            </div>
            <Badge variant="default">Friends</Badge>
          </div>
        </div>
      </Card>

      {/* Account Section */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        
        <div className="space-y-4">
          <Link to="/forgot-password" className="block">
            <Button variant="secondary" className="w-full justify-start">
              Change Password
            </Button>
          </Link>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">Member since</p>
            <p className="text-sm">
              {profile?.created_at 
                ? new Date(profile.created_at).toLocaleDateString() 
                : 'Unknown'}
            </p>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        
        <div className="space-y-4">
          <Button 
            variant="secondary" 
            className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50"
            onClick={handleLogout}
            isLoading={isLoading}
          >
            Log Out
          </Button>

          <Button 
            variant="secondary" 
            className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
