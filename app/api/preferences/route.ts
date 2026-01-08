import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserPreferences, updateUserPreferences } from '@/lib/db-preferences';

// GET - Fetch user preferences
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await getUserPreferences(clerkUserId);

    return NextResponse.json({ preferences });
  } catch (error: any) {
    console.error('Error in GET /api/preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Update user preferences
export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();

    const updatedPreferences = await updateUserPreferences(clerkUserId, updates);

    if (!updatedPreferences) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      preferences: updatedPreferences,
      message: 'Preferences updated successfully'
    });
  } catch (error: any) {
    console.error('Error in POST /api/preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
