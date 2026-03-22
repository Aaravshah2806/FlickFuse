import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Profile, FriendRequest, Friendship } from '../types';

export default function Friends() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const loadFriends = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*, friend:profiles!friendships_friend_id_fkey(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      setFriends(data || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        supabase
          .from('friend_requests')
          .select('*, sender:profiles!friend_requests_sender_id_fkey(*)')
          .eq('receiver_id', user.id)
          .eq('status', 'pending'),
        supabase
          .from('friend_requests')
          .select('*, receiver:profiles!friend_requests_receiver_id_fkey(*)')
          .eq('sender_id', user.id)
          .eq('status', 'pending')
      ]);

      setIncomingRequests(incomingRes.data || []);
      setOutgoingRequests(outgoingRes.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      loadFriends();
      loadRequests();
    }
  }, [user, loadFriends, loadRequests]);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%,unique_id.ilike.%${searchQuery}%`)
        .neq('id', user?.id)
        .limit(10);

      if (error) throw error;
      
      const filteredResults = (data || []).filter(
        (profile) => !friends.some((f) => f.friend_id === profile.id) &&
                   !incomingRequests.some((r) => r.sender_id === profile.id) &&
                   !outgoingRequests.some((r) => r.receiver_id === profile.id)
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({ sender_id: user?.id, receiver_id: receiverId, status: 'pending' });

      if (error) throw error;
      
      setSearchResults(searchResults.filter((r) => r.id !== receiverId));
      loadRequests();
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.rpc('accept_friend_request', { request_id: requestId });
      
      if (error) {
        const { error: updateError } = await supabase
          .from('friend_requests')
          .update({ status: 'accepted' })
          .eq('id', requestId);
        
        if (updateError) throw updateError;
      }
      
      loadRequests();
      loadFriends();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      await Promise.all([
        supabase.from('friendships').delete().eq('user_id', user?.id).eq('friend_id', friendId),
        supabase.from('friendships').delete().eq('user_id', friendId).eq('friend_id', user?.id)
      ]);
      loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const tabs = [
    { id: 'friends', label: 'Friends', count: friends.length },
    { id: 'requests', label: 'Requests', count: incomingRequests.length },
    { id: 'search', label: 'Find Friends' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Friends</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-gray-600 hover:text-[#2563EB]'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[#2563EB] text-white">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2563EB] border-t-transparent"></div>
        </div>
      ) : (
        <>
          {activeTab === 'friends' && (
            <div>
              {friends.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-lg font-medium">No friends yet</p>
                  <p className="text-sm mt-1">Search for users to connect</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.map((friendship) => (
                    <div key={friendship.id} className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                        {friendship.friend?.avatar_url ? (
                          <img src={friendship.friend.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                            {friendship.friend?.display_name?.[0] || friendship.friend?.username?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {friendship.friend?.display_name || friendship.friend?.username || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{friendship.friend?.unique_id || '---'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFriend(friendship.friend_id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove friend"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              {incomingRequests.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Incoming Requests</h2>
                  <div className="space-y-3">
                    {incomingRequests.map((request) => (
                      <div key={request.id} className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                          {request.sender?.avatar_url ? (
                            <img src={request.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                              {request.sender?.display_name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {request.sender?.display_name || request.sender?.username || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500">@{request.sender?.unique_id || '---'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptRequest(request.id)}
                            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors text-sm font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => rejectRequest(request.id)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {outgoingRequests.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Sent Requests</h2>
                  <div className="space-y-3">
                    {outgoingRequests.map((request) => (
                      <div key={request.id} className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                          {request.receiver?.avatar_url ? (
                            <img src={request.receiver.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                              {request.receiver?.display_name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {request.receiver?.display_name || request.receiver?.username || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500">@{request.receiver?.unique_id || '---'}</p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Pending</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg font-medium">No pending requests</p>
                  <p className="text-sm mt-1">Search for users to send friend requests</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                    placeholder="Search by username, display name, or ID (e.g., ABC-12345)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={searchUsers}
                  disabled={searching || !searchQuery.trim()}
                  className="px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((profile) => (
                    <div key={profile.id} className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                            {profile.display_name?.[0] || profile.username?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {profile.display_name || profile.username || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">@{profile.unique_id || '---'}</p>
                      </div>
                      <button
                        onClick={() => sendFriendRequest(profile.id)}
                        className="px-4 py-2 border border-[#2563EB] text-[#2563EB] rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                      >
                        Add Friend
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchQuery && !searching ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No users found matching "{searchQuery}"</p>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
