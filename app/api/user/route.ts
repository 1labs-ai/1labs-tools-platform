import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { 
  getOrCreateUserProfile, 
  getTransactionHistory, 
  getGenerationHistory 
} from '@/lib/credits';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    
    // Get or create user profile
    const profile = await getOrCreateUserProfile(
      userId,
      user?.emailAddresses?.[0]?.emailAddress,
      user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined
    );

    // Get recent transactions
    const transactions = await getTransactionHistory(userId, 10);

    // Get recent generations
    const generations = await getGenerationHistory(userId, 10);

    return NextResponse.json({
      profile: {
        id: profile.id,
        credits: profile.credits,
        plan: profile.plan,
        email: profile.email,
        name: profile.name,
        createdAt: profile.created_at,
      },
      recentTransactions: transactions,
      recentGenerations: generations,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
