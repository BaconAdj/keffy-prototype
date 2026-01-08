import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getConversation, getMessages } from '@/lib/db-conversations';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;

    // Get conversation
    const conversation = await getConversation(conversationId);
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify this conversation belongs to the user
    if (conversation.user_id !== clerkUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get messages
    const messages = await getMessages(conversationId);

    return NextResponse.json({
      conversation,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });
  } catch (error: any) {
    console.error('Error in GET /api/conversations/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
