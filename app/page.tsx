'use client';

import { Suspense } from 'react';
import ChatPage from '@/components/ChatPage';

function ChatPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-navy">Loading...</div>
      </div>
    }>
      <ChatPage />
    </Suspense>
  );
}

export default ChatPageWrapper;
