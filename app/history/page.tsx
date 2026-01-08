'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface ConversationItem {
  id: string;
  title: string;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
}

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      loadConversations();
    }
  }, [isLoaded, user]);

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations/list');
      if (!response.ok) throw new Error('Failed to load conversations');
      
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-navy">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
      {/* Phone Frame */}
      <div className="w-full max-w-[400px] h-[90vh] max-h-[844px] bg-sand rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-navy text-white px-5 py-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-vibes text-3xl text-gold">History</h1>
            <Link 
              href="/"
              className="text-xs px-3 py-1.5 bg-gold/20 text-gold rounded-full hover:bg-gold/30 transition-colors"
            >
              New Chat
            </Link>
          </div>
          <p className="text-sm text-white/70">Your conversations with Keffy</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          
          {conversations.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-navy mb-2">No conversations yet</h2>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Start chatting with Keffy to plan your next trip. All your conversations will be saved here.
              </p>
              
              <Link 
                href="/"
                className="px-6 py-3 bg-gold text-white rounded-full font-medium hover:bg-gold/90 transition-colors"
              >
                Start Chatting
              </Link>
            </div>
          ) : (
            /* Conversation List */
            <div className="space-y-3">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/?id=${conv.id}`}
                  className="block bg-white rounded-2xl p-4 shadow-sm border border-border hover:border-gold/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-navy text-sm flex-1 pr-2 line-clamp-2">
                      {conv.title}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(conv.last_message_at || conv.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      {conv.message_count} messages
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>

        {/* Bottom Navigation */}
        <div className="px-5 py-2 pb-5 bg-sand/98 backdrop-blur-sm border-t border-border/40 flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:bg-border/30 transition-colors">
            <div className="font-vibes text-[2rem] leading-none -mt-1">K</div>
            <span className="text-[11px] font-medium">Keffy</span>
          </Link>
          
          <Link href="/bookings" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:bg-border/30 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="text-[11px] font-medium">Bookings</span>
          </Link>
          
          <Link href="/account" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:bg-border/30 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[11px] font-medium">Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
