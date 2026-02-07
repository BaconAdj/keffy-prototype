// app/api/conversations/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firstMessage, messages } = body;

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: firstMessage.substring(0, 100), // First 100 chars as title
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    // Insert messages
    const messagesToInsert = messages.map((msg: any) => ({
      conversation_id: conversation.id,
      role: msg.role,
      content: msg.content,
    }));

    const { error: msgError } = await supabase
      .from('messages')
      .insert(messagesToInsert);

    if (msgError) {
      console.error('Error creating messages:', msgError);
      return NextResponse.json({ error: 'Failed to save messages' }, { status: 500 });
    }

    return NextResponse.json({ 
      conversationId: conversation.id,
      success: true 
    });

  } catch (error) {
    console.error('Error in conversations API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
