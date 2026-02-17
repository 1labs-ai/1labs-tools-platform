import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isConvexConfigured, INITIAL_CREDITS } from '@/lib/convex';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();

    // If Convex not configured, return mock data
    // TODO: Replace with actual Convex calls once initialized
    if (!isConvexConfigured()) {
      return NextResponse.json({
        profile: {
          id: 'mock-id',
          credits: INITIAL_CREDITS,
          plan: 'free',
          email: user?.emailAddresses?.[0]?.emailAddress || null,
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
          createdAt: new Date().toISOString(),
        },
        recentTransactions: [],
        recentGenerations: [],
      });
    }

    // When Convex is configured, this will use the real client
    // For now, return mock data
    return NextResponse.json({
      profile: {
        id: userId,
        credits: INITIAL_CREDITS,
        plan: 'free',
        email: user?.emailAddresses?.[0]?.emailAddress || null,
        name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
        createdAt: new Date().toISOString(),
      },
      recentTransactions: [],
      recentGenerations: [],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
