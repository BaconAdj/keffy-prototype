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
};

type Message = {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Protect the admin page - only allow specific email
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
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
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

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user || user.primaryEmailAddress?.emailAddress !== 'general@keffyai.com') {
    return null; // Router will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-navy mb-2">Keffy Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">View all user conversations</p>

        <div className="grid grid-cols-2 gap-6">
          {/* Conversations List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-navy mb-2">
                Conversations ({filteredConversations.length})
              </h2>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No conversations yet</p>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => loadMessages(conv.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedConv === conv.id
                        ? 'border-gold bg-sand/30'
                        : 'border-gray-200 hover:border-gold hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-semibold text-navy line-clamp-2">{conv.title}</p>
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
                  {selectedConv ? 'No messages in this conversation' : 'Click a conversation to view messages'}
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
      </div>
    </div>
  );
}
