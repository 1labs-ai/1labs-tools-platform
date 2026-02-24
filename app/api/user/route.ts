import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { convex, isConvexConfigured } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { INITIAL_CREDITS } from "@/lib/credits";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || null;
    const name = user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : null;

    // If Convex not configured, return mock data
    if (!isConvexConfigured()) {
      return NextResponse.json({
        profile: {
          id: "mock-id",
          credits: INITIAL_CREDITS,
          plan: "free",
          email,
          name,
          createdAt: new Date().toISOString(),
        },
        recentTransactions: [],
        recentGenerations: [],
      });
    }

    // Get or create user profile
    const profile = await convex.mutation(api.users.getOrCreateByClerkId, {
      clerkId: userId,
      email: email || undefined,
      name: name || undefined,
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Failed to get or create user profile" },
        { status: 500 }
      );
    }

    // Get recent transactions
    const transactions = await convex.query(api.credits.getTransactionHistory, {
      clerkId: userId,
      limit: 10,
    });

    // Get recent generations
    const generations = await convex.query(api.generations.list, {
      clerkId: userId,
      limit: 10,
    });

    return NextResponse.json({
      profile: {
        id: profile._id,
        credits: profile.credits,
        plan: profile.plan,
        email: profile.email || email,
        name: profile.name || name,
        createdAt: new Date(profile._creationTime).toISOString(),
      },
      recentTransactions: transactions.map((tx) => ({
        id: tx._id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description || null,
        tool_type: tx.toolType || null,
        created_at: new Date(tx._creationTime).toISOString(),
      })),
      recentGenerations: generations.map((gen) => ({
        id: gen._id,
        tool_type: gen.toolType,
        title: gen.title || null,
        input: gen.input || {},
        output: gen.output || {},
        credits_used: gen.creditsUsed,
        created_at: new Date(gen._creationTime).toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
