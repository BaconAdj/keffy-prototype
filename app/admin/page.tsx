'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

type Conversation = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  deleted_by_user: boolean;
};

type Message = {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

type UserProfile = {
  userId: string;
  email: string;
  name: string;
  conversationCount: number;
  lastActivity: string;
};

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [view, setView] = useState<'users' | 'conversations'>('users');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showDeleted, setShowDeleted] = useState(true);

  // Protect the admin page
  useEffect(() => {
    if (isLoaded && (!user || user.primaryEmailAddress?.emailAddress !== 'general@keffyai.com')) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (isLoaded && user) {
      loadConversations();
    }
  }, [isLoaded, user]);

  async function loadConversations() {
    try {
      const response = await fetch('/api/admin/conversations');
      const data = await response.json();
      const convs = data.conversations || [];
      setConversations(convs);
      
      // Build user profiles
      const profiles = buildUserProfiles(convs);
      setUserProfiles(profiles);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }

  function buildUserProfiles(convs: Conversation[]): UserProfile[] {
    const userMap = new Map<string, UserProfile>();
    
    convs.forEach(conv => {
      if (!userMap.has(conv.user_id)) {
        userMap.set(conv.user_id, {
          userId: conv.user_id,
          email: conv.user_id, // Will be replaced by Clerk email if available
          name: conv.user_id.slice(0, 8),
          conversationCount: 0,
          lastActivity: conv.updated_at,
        });
      }
      
      const profile = userMap.get(conv.user_id)!;
      profile.conversationCount++;
      
      // Update last activity if this is more recent
      if (new Date(conv.updated_at) > new Date(profile.lastActivity)) {
        profile.lastActivity = conv.updated_at;
      }
    });
    
    return Array.from(userMap.values())
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }

  async function loadMessages(convId: string) {
    try {
      const response = await fetch(`/api/admin/conversations/${convId}`);
      const data = await response.json();
      setMessages(data.messages || []);
      setSelectedConv(convId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  function filterByDate(conv: Conversation): boolean {
    const convDate = new Date(conv.updated_at);
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return convDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return convDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return convDate >= monthAgo;
      default:
        return true;
    }
  }

  const filteredConversations = conversations
    .filter(conv => {
      // Filter by deleted status
      if (!showDeleted && conv.deleted_by_user) return false;
      
      // Filter by selected user
      if (selectedUser && conv.user_id !== selectedUser) return false;
      
      // Filter by date
      if (!filterByDate(conv)) return false;
      
      // Filter by search term
      if (searchTerm && !conv.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user || user.primaryEmailAddress?.emailAddress !== 'general@keffyai.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Keffy Admin Dashboard</h1>
          <p className="text-gray-600">
            {conversations.length} total conversations from {userProfiles.length} users
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'users'
                ? 'bg-navy text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            👥 By User
          </button>
          <button
            onClick={() => setView('conversations')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'conversations'
                ? 'bg-navy text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            💬 All Conversations
          </button>
        </div>

        {view === 'users' ? (
          /* User Profile View */
          <div className="grid grid-cols-3 gap-6">
            {/* Users List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-navy mb-4">Users</h2>
              <div className="space-y-2 max-h-[700px] overflow-y-auto">
                {userProfiles.map((profile) => (
                  <div
                    key={profile.userId}
                    onClick={() => {
                      setSelectedUser(profile.userId);
                      setSelectedConv(null);
                    }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedUser === profile.userId
                        ? 'border-gold bg-sand/30'
                        : 'border-gray-200 hover:border-gold hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-semibold text-navy">{profile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {profile.userId.slice(0, 12)}...
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {profile.conversationCount} conversation{profile.conversationCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Last: {new Date(profile.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* User's Conversations */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-navy mb-4">
                {selectedUser ? 'User Conversations' : 'Select a user'}
              </h2>
              {selectedUser && (
                <div className="space-y-2 max-h-[700px] overflow-y-auto">
                  {conversations
                    .filter(c => c.user_id === selectedUser)
                    .map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => loadMessages(conv.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedConv === conv.id
                            ? 'border-gold bg-sand/30'
                            : 'border-gray-200 hover:border-gold hover:bg-gray-50'
                        } ${conv.deleted_by_user ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-navy line-clamp-2">{conv.title}</p>
                          {conv.deleted_by_user && (
                            <span className="text-xs text-red-500 font-bold">DELETED</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(conv.updated_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-navy mb-4">
                {selectedConv ? 'Messages' : 'Select a conversation'}
              </h2>
              <div className="space-y-3 max-h-[700px] overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {selectedConv ? 'No messages' : 'Click a conversation to view'}
                  </p>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      className={`p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-sand/50 border border-gold/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-wide">
                          {msg.role === 'user' ? '👤 User' : '🤖 Keffy'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* All Conversations View */
          <div className="grid grid-cols-2 gap-6">
            {/* Conversations List with Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-navy mb-4">
                  Conversations ({filteredConversations.length})
                </h2>
                
                {/* Filters */}
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  
                  <div className="flex gap-2">
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as any)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Past Week</option>
                      <option value="month">Past Month</option>
                    </select>
                    
                    <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={showDeleted}
                        onChange={(e) => setShowDeleted(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Show deleted</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No conversations found</p>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => loadMessages(conv.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedConv === conv.id
                          ? 'border-gold bg-sand/30'
                          : 'border-gray-200 hover:border-gold hover:bg-gray-50'
                      } ${conv.deleted_by_user ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-navy line-clamp-2">{conv.title}</p>
                        {conv.deleted_by_user && (
                          <span className="text-xs text-red-500 font-bold">DELETED</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        User: {conv.user_id.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conv.updated_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-navy mb-4">
                {selectedConv ? 'Messages' : 'Select a conversation'}
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {selectedConv ? 'No messages' : 'Click a conversation to view'}
                  </p>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      className={`p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-sand/50 border border-gold/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-wide">
                          {msg.role === 'user' ? '👤 User' : '🤖 Keffy'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
