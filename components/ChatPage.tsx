'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseTravelLink } from '@/lib/link-parser';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

function parseMarkdownLinks(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Regex to match markdown links
  const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
  let match;
  
  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    const linkText = match[1];
    const linkUrl = match[2];
    
    // Try to parse as travel link first
    const travelLink = parseTravelLink(linkUrl);
    const finalUrl = travelLink ? travelLink.url : linkUrl;
    const finalText = travelLink ? travelLink.text : linkText;
    
    // Create the clickable link
    parts.push(
      <a
        key={match.index}
        href={finalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gold underline hover:text-[#b89451] font-semibold break-words"
      >
        {finalText}
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : [text];
}

export default function ChatPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && user && conversationId) {
      loadConversation(conversationId);
    }
  }, [isLoaded, user, conversationId]);

  useEffect(() => {
    if (isLoaded && user && messages.length === 0 && !conversationId) {
      const greeting = user.firstName 
        ? `Hi ${user.firstName}! I'm Keffy, your travel concierge. I'd love to help you plan something special. What are you thinking about for your next trip?`
        : "Hi there! I'm Keffy, your travel concierge. I'd love to help you plan something special. What are you thinking about for your next trip?";
      
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isLoaded, user, conversationId, messages.length]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) throw new Error('Failed to load conversation');
      
      const data = await response.json();
      setMessages(data.messages);
      setCurrentConversationId(id);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const saveConversation = async (conversationMessages: Message[]) => {
    if (!user || isSaving) return;
    
    setIsSaving(true);
    try {
      if (!currentConversationId) {
        const firstUserMessage = conversationMessages.find(m => m.role === 'user');
        if (!firstUserMessage) return;

        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            firstMessage: firstUserMessage.content,
            messages: conversationMessages
          }),
        });

        if (!response.ok) throw new Error('Failed to create conversation');
        
        const data = await response.json();
        setCurrentConversationId(data.conversationId);
        window.history.pushState({}, '', `/?id=${data.conversationId}`);
      } else {
        const lastTwoMessages = conversationMessages.slice(-2);
        
        const response = await fetch(`/api/conversations/${currentConversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: lastTwoMessages }),
        });

        if (!response.ok) throw new Error('Failed to save messages');
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      console.log('Received message from API:', data.message);
      
      const updatedMessages = [...newMessages, { 
        role: 'assistant' as const, 
        content: data.message 
      }];
      
      setMessages(updatedMessages);
      await saveConversation(updatedMessages);
      
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble connecting right now. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    window.history.pushState({}, '', '/');
    
    if (user) {
      const greeting = user.firstName 
        ? `Hi ${user.firstName}! I'm Keffy, your travel concierge. I'd love to help you plan something special. What are you thinking about for your next trip?`
        : "Hi there! I'm Keffy, your travel concierge. I'd love to help you plan something special. What are you thinking about for your next trip?";
      
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-navy">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
        <div className="w-full max-w-[400px] bg-sand rounded-[40px] shadow-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="font-vibes text-gold text-4xl">Keffy</div>
            <span className="bg-navy text-white text-xs font-bold px-2 py-1 rounded-full">EARLY BETA</span>
          </div>
          <p className="text-navy text-lg mb-6">Your personal travel concierge</p>
          <p className="text-gray-600 mb-8">Sign in to start planning your next adventure</p>
          <SignInButton mode="modal">
            <button className="w-full bg-gold text-white py-3 px-6 rounded-full hover:bg-[#b89451] transition-colors font-medium">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
      <div className="w-full max-w-[400px] h-[90vh] max-h-[844px] bg-sand rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative">
        
        <div className="absolute top-0 left-0 right-0 z-10 bg-sand/95 backdrop-blur-sm border-b border-border/30 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="font-vibes text-gold text-2xl">Keffy</div>
              <span className="bg-navy text-white text-[10px] font-bold px-2 py-0.5 rounded-full">BETA</span>
            </div>
            {currentConversationId && (
              <button
                onClick={startNewConversation}
                className="text-xs px-3 py-1.5 bg-gold/10 text-gold rounded-full hover:bg-gold/20 transition-colors"
              >
                New Chat
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/history"
              className="text-navy hover:text-gold transition-colors"
              title="Conversation History"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9"
                }
              }}
            />
          </div>
        </div>

        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-5 pt-[60px] pb-5 chat-scroll"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 flex animate-fade-in ${
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[80%] px-[18px] py-[14px] rounded-[20px] leading-relaxed text-[15px] break-words ${
                  message.role === 'assistant'
                    ? 'bg-navy text-white rounded-bl-[4px] shadow-md'
                    : 'bg-white text-navy border-[1.5px] border-border rounded-br-[4px] shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {parseMarkdownLinks(message.content)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="mb-4 flex justify-start">
              <div className="max-w-[80%] px-[18px] py-[14px] rounded-[20px] bg-navy text-white rounded-bl-[4px]">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {isSaving && (
            <div className="text-center text-xs text-gray-400 mb-2">
              Saving...
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-sand/95 backdrop-blur-sm border-t border-border/30">
          <div className="flex gap-2.5 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-[1.5px] border-border rounded-[24px] text-[15px] resize-none max-h-[100px] outline-none focus:border-gold bg-white disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="w-11 h-11 bg-gold rounded-full flex items-center justify-center hover:bg-[#b89451] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-5 py-2 pb-5 bg-sand/98 backdrop-blur-sm border-t border-border/40 flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gold">
            <div className="font-vibes text-[2rem] leading-none -mt-1">K</div>
            <span className="text-[11px] font-medium">Keffy</span>
          </Link>
          
          <button 
            disabled
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-300 cursor-not-allowed transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium">Bookings</span>
              <span className="text-[8px] text-gold font-semibold">Coming Soon</span>
            </div>
          </button>
          
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
