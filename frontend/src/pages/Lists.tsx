import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import type { List, ListItem, SearchContent, VisibilityLevel } from '../types';
import { getImageUrl } from '../lib/supabase';

export default function Lists() {
  const { user } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListVisibility, setNewListVisibility] = useState<VisibilityLevel>('private');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchContent[]>([]);

  useEffect(() => {
    if (user) {
      loadLists();
    }
  }, [user]);

  useEffect(() => {
    if (selectedList) {
      loadListItems(selectedList.id);
    }
  }, [selectedList]);

  const loadLists = async () => {
    try {
      const { data, error } = await supabase
        .from('user_lists')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setLists(data || []);
      if (data && data.length > 0 && !selectedList) {
        setSelectedList(data[0]);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadListItems = async (listId: string) => {
    try {
      const { data, error } = await supabase
        .from('list_items')
        .select('*, content:content(*)')
        .eq('list_id', listId)
        .order('position');

      if (error) throw error;
      setListItems(data || []);
    } catch (error) {
      console.error('Error loading list items:', error);
    }
  };

  const createList = async () => {
    if (!newListTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('user_lists')
        .insert({
          user_id: user?.id,
          title: newListTitle.trim(),
          description: newListDescription.trim() || null,
          visibility: newListVisibility
        });

      if (error) throw error;

      setShowCreateModal(false);
      setNewListTitle('');
      setNewListDescription('');
      setNewListVisibility('private');
      loadLists();
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const deleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list?')) return;

    try {
      const { error } = await supabase.from('user_lists').delete().eq('id', listId);
      if (error) throw error;

      if (selectedList?.id === listId) {
        setSelectedList(null);
        setListItems([]);
      }
      loadLists();
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const removeItem = async (contentId: string) => {
    if (!selectedList) return;

    try {
      const { error } = await supabase
        .from('list_items')
        .delete()
        .eq('list_id', selectedList.id)
        .eq('content_id', contentId);

      if (error) throw error;
      loadListItems(selectedList.id);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const searchContent = async () => {
    if (!searchQuery.trim()) return;

    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .ilike('title', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching content:', error);
    }
  };

  const addToList = async (contentId: string) => {
    if (!selectedList) return;

    try {
      const { error } = await supabase
        .from('list_items')
        .insert({
          list_id: selectedList.id,
          content_id: contentId,
          position: listItems.length
        });

      if (error) throw error;

      setShowAddContentModal(false);
      setSearchQuery('');
      setSearchResults([]);
      loadListItems(selectedList.id);
      loadLists();
    } catch (error) {
      console.error('Error adding to list:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Lists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create List
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2563EB] border-t-transparent"></div>
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <p className="text-lg font-medium">No lists yet</p>
          <p className="text-sm mt-1">Create a list to organize your favorite content</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-medium text-gray-900">Your Lists</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedList(list)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedList?.id === list.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{list.title}</p>
                        {list.description && (
                          <p className="text-sm text-gray-500 truncate mt-1">{list.description}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteList(list.id);
                        }}
                        className="text-gray-400 hover:text-red-500 ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        list.visibility === 'public' ? 'bg-green-100 text-green-700' :
                        list.visibility === 'friends' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {list.visibility}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedList ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedList.title}</h2>
                      {selectedList.description && (
                        <p className="text-gray-500 mt-1">{selectedList.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAddContentModal(true)}
                      className="px-4 py-2 border border-[#2563EB] text-[#2563EB] rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      Add Content
                    </button>
                  </div>
                </div>

                {listItems.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <p>No content in this list yet</p>
                    <button
                      onClick={() => setShowAddContentModal(true)}
                      className="mt-4 text-[#2563EB] hover:underline"
                    >
                      Add your first item
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {listItems.map((item) => (
                      <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <span className="text-gray-400 font-medium w-6">{item.position + 1}</span>
                        <div className="w-16 h-24 rounded-md overflow-hidden bg-gray-200">
                          {item.content?.poster_url ? (
                            <img
                              src={getImageUrl(item.content.poster_url)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/content/${item.content?.content_type || 'movie'}/${item.content_id}`}
                            className="font-medium text-gray-900 hover:text-[#2563EB] truncate block"
                          >
                            {item.content?.title || 'Unknown Title'}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {item.content?.release_year || 'N/A'} • {item.content?.content_type || 'N/A'}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.content_id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                <p>Select a list to view its contents</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New List</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  placeholder="My Favorite Movies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  placeholder="A collection of my all-time favorites"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <select
                  value={newListVisibility}
                  onChange={(e) => setNewListVisibility(e.target.value as VisibilityLevel)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                >
                  <option value="private">Private - Only you can see</option>
                  <option value="friends">Friends - Your friends can see</option>
                  <option value="public">Public - Anyone can see</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createList}
                disabled={!newListTitle.trim()}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddContentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Content</h2>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchContent()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                placeholder="Search by title..."
              />
              <button
                onClick={searchContent}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors"
              >
                Search
              </button>
            </div>
            {searchResults.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {searchResults.map((content) => (
                  <button
                    key={content.id}
                    onClick={() => addToList(content.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className="w-12 h-16 rounded bg-gray-200 overflow-hidden">
                      {content.poster_url && (
                        <img src={getImageUrl(content.poster_url)} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{content.title}</p>
                      <p className="text-sm text-gray-500">{content.release_year || 'N/A'} • {content.content_type}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <p className="text-center text-gray-500 py-4">No content found</p>
            ) : (
              <p className="text-center text-gray-500 py-4">Search for content to add</p>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowAddContentModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
