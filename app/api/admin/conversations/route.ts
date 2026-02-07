// app/api/admin/conversations/route.ts
import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[ADMIN] Fetching conversations for user:', userId);

    // Create Supabase admin client (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all conversations
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    console.log('[ADMIN] Found conversations:', conversations?.length || 0);

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: 'Failed to fetch conversations', details: error.message }, { status: 500 });
    }

    // Get unique user IDs
    const userIds = Array.from(new Set(conversations?.map(c => c.user_id) || []));
    console.log('[ADMIN] Fetching details for', userIds.length, 'users');

    // Fetch user details from Clerk
    const userDetailsMap = new Map();
    const clerk = await clerkClient();
    
    for (const clerkUserId of userIds) {
      try {
        const user = await clerk.users.getUser(clerkUserId);
        userDetailsMap.set(clerkUserId, {
          email: user.emailAddresses[0]?.emailAddress || 'No email',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
          imageUrl: user.imageUrl || null,
          createdAt: user.createdAt,
        });
      } catch (err) {
        console.error(`Failed to fetch user ${clerkUserId}:`, err);
        userDetailsMap.set(clerkUserId, {
          email: 'Unknown',
          firstName: '',
          lastName: '',
          fullName: 'Unknown User',
          imageUrl: null,
          createdAt: null,
        });
      }
    }

    // Fetch user preferences from Supabase
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .in('user_id', userIds);

    const preferencesMap = new Map();
    preferences?.forEach(pref => {
      preferencesMap.set(pref.user_id, pref);
    });

    console.log('[ADMIN] User details fetched:', userDetailsMap.size);
    console.log('[ADMIN] Preferences fetched:', preferencesMap.size);

    return NextResponse.json({ 
      conversations: conversations || [],
      userDetails: Object.fromEntries(userDetailsMap),
      userPreferences: Object.fromEntries(preferencesMap),
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
