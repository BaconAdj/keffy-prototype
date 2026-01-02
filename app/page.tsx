'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi there! I'm Keffy, your travel concierge. I'd love to help you plan something special. What are you thinking about for your next trip?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
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
      
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: data.message 
      }]);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
      {/* Phone Frame */}
      <div className="w-full max-w-[400px] h-[90vh] max-h-[844px] bg-sand rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Chat Messages */}
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
                className={`max-w-[80%] px-[18px] py-[14px] rounded-[20px] leading-relaxed text-[15px] ${
                  message.role === 'assistant'
                    ? 'bg-navy text-white rounded-bl-[4px] shadow-md'
                    : 'bg-white text-navy border-[1.5px] border-border rounded-br-[4px] shadow-sm'
                }`}
              >
                {message.content}
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
        </div>

        {/* Input Area */}
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

        {/* Bottom Navigation */}
        <div className="px-5 py-2 pb-5 bg-sand/98 backdrop-blur-sm border-t border-border/40 flex justify-around items-center">
          <div className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gold">
            <div className="font-vibes text-[2rem] leading-none -mt-1">K</div>
            <span className="text-[11px] font-medium">Keffy</span>
          </div>
          
          <div className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 cursor-not-allowed">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="text-[11px] font-medium">Bookings</span>
          </div>
          
          <div className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 cursor-not-allowed">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[11px] font-medium">Account</span>
          </div>
        </div>
      </div>
    </div>
  );
}
