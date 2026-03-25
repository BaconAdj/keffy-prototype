'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
};

export default function HistoryPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    } else if (isLoaded && isSignedIn) {
      loadConversations();
    }
  }, [isLoaded, isSignedIn, router]);

  async function loadConversations() {
    try {
      const response = await fetch('/api/user/conversations');
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteConversation(id: string, title: string) {
    const truncatedTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;
    if (!confirm(`Delete "${truncatedTitle}"?\n\nThis can't be undone.`)) {
      return;
    }

    setDeletingId(id);
    
    try {
      const response = await fetch(`/api/conversations/${id}/delete`, {
        method: 'POST',
      });

      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
      } else {
        alert('Failed to delete conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
      <div className="w-full max-w-[400px] min-h-[90vh] max-h-[844px] bg-sand rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-navy px-6 py-8 rounded-t-[40px]">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-vibes text-gold text-4xl">History</h1>
            <Link
              href="/"
              className="bg-gold text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#b89451] transition-colors"
            >
              New Chat
            </Link>
          </div>
          <p className="text-sand/80 text-sm">Your conversations with Keffy</p>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No conversations yet</p>
              <Link
                href="/"
                className="inline-block bg-gold text-white px-6 py-3 rounded-full font-medium hover:bg-[#b89451] transition-colors"
              >
                Start Your First Chat
              </Link>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className="bg-white rounded-2xl shadow-sm border border-border/30 overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link
                  href={`/?id=${conv.id}`}
                  className="block p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-navy font-medium line-clamp-2 mb-1">
                        {conv.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(conv.last_message_at || conv.updated_at)}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
                
                {/* Delete Button */}
                <div className="px-4 pb-3 flex justify-end border-t border-border/10 pt-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      deleteConversation(conv.id, conv.title);
                    }}
                    disabled={deletingId === conv.id}
                    className="text-red-400 hover:text-red-600 text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deletingId === conv.id ? (
                      <span className="text-gray-400">Deleting...</span>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-border/30 px-5 py-3 flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:bg-border/30 transition-colors">
            <div className="font-vibes text-gold text-2xl">K</div>
            <span className="text-[11px] font-medium">Keffy</span>
          </Link>
          
          <Link href="/bookings" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:text-gold transition-colors">
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
