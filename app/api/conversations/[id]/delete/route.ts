// app/api/conversations/[id]/delete/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Soft delete - just mark as deleted by user
    const { error } = await supabase
      .from('conversations')
      .update({ deleted_by_user: true })
      .eq('id', conversationId)
      .eq('user_id', userId); // Only delete own conversations

    if (error) {
      console.error('Error deleting conversation:', error);
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
