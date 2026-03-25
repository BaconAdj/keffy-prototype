// app/api/user/conversations/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserConversations } from '@/lib/db-conversations';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use the existing db-conversations helper which queries correctly
    // using status = 'active' — not deleted_by_user which doesn't exist
    const conversations = await getUserConversations(userId);

    return NextResponse.json({ conversations: conversations || [] });
  } catch (error) {
    console.error('User conversations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
