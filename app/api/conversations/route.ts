import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createConversation, addMessages } from '@/lib/db-conversations';

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstMessage, messages } = await req.json();

    if (!firstMessage || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create conversation
    const conversation = await createConversation(clerkUserId, firstMessage);
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      );
    }

    // Add all messages
    const success = await addMessages(conversation.id, messages);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      conversationId: conversation.id,
      message: 'Conversation created successfully'
    });
  } catch (error: any) {
    console.error('Error in POST /api/conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
