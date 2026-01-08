import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getConversation, addMessages } from '@/lib/db-conversations';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Verify conversation belongs to user
    const conversation = await getConversation(conversationId);
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.user_id !== clerkUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Add messages
    const success = await addMessages(conversationId, messages);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Messages added successfully'
    });
  } catch (error: any) {
    console.error('Error in POST /api/conversations/[id]/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
