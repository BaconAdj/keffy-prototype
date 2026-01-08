import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserConversations } from '@/lib/db-conversations';

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await getUserConversations(clerkUserId);

    return NextResponse.json({
      conversations
    });
  } catch (error: any) {
    console.error('Error in GET /api/conversations/list:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
