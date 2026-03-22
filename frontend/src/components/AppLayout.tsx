import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from './ui/Badge';
import Dashboard from '../pages/Dashboard';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children?: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-bold text-xl text-gray-900">FlickFuse</span>
              </Link>
              <div className="hidden md:flex ml-10 space-x-8">
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 font-medium ${isActive('/dashboard') ? 'text-[#2563EB]' : 'text-gray-700 hover:text-[#2563EB]'}`}
                >
                  Home
                </Link>
                <Link 
                  to="/discover" 
                  className={`px-3 py-2 font-medium ${isActive('/discover') ? 'text-[#2563EB]' : 'text-gray-700 hover:text-[#2563EB]'}`}
                >
                  Discover
                </Link>
                <Link 
                  to="/import" 
                  className={`px-3 py-2 font-medium ${isActive('/import') ? 'text-[#2563EB]' : 'text-gray-700 hover:text-[#2563EB]'}`}
                >
                  Import
                </Link>
                <Link 
                  to="/friends" 
                  className={`px-3 py-2 font-medium ${isActive('/friends') ? 'text-[#2563EB]' : 'text-gray-700 hover:text-[#2563EB]'}`}
                >
                  Friends
                </Link>
                <Link 
                  to="/lists" 
                  className={`px-3 py-2 font-medium ${isActive('/lists') ? 'text-[#2563EB]' : 'text-gray-700 hover:text-[#2563EB]'}`}
                >
                  Lists
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/settings" className={`p-2 ${isActive('/settings') || isActive('/settings/profile') ? 'text-[#2563EB]' : 'text-gray-700 hover:text-[#2563EB]'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">
                    {profile?.display_name || 'User'}
                  </span>
                  <Badge variant="default" size="sm">
                    {profile?.unique_id || '---'}
                  </Badge>
                </div>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children || <Dashboard />}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Link to="/dashboard" className={`flex flex-col items-center p-2 ${isActive('/dashboard') ? 'text-[#2563EB]' : 'text-gray-700'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/discover" className={`flex flex-col items-center p-2 ${isActive('/discover') ? 'text-[#2563EB]' : 'text-gray-700'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs mt-1">Discover</span>
          </Link>
          <Link to="/import" className={`flex flex-col items-center p-2 ${isActive('/import') ? 'text-[#2563EB]' : 'text-gray-700'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-xs mt-1">Import</span>
          </Link>
          <Link to="/friends" className={`flex flex-col items-center p-2 ${isActive('/friends') ? 'text-[#2563EB]' : 'text-gray-700'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs mt-1">Friends</span>
          </Link>
          <Link to="/lists" className={`flex flex-col items-center p-2 ${isActive('/lists') ? 'text-[#2563EB]' : 'text-gray-700'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="text-xs mt-1">Lists</span>
          </Link>
          <Link to="/settings" className={`flex flex-col items-center p-2 ${isActive('/settings') || isActive('/settings/profile') ? 'text-[#2563EB]' : 'text-gray-700'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
