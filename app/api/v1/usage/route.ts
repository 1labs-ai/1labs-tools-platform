import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { getUserCredits, getTransactionHistory, getGenerationHistory, CreditTransaction, Generation } from "@/lib/credits";
import { convex, isConvexConfigured } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const authHeader = request.headers.get("Authorization");
    const validation = await validateApiKey(authHeader);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 401 }
      );
    }

    const clerkId = validation.clerkId!;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all"; // all, month, week
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    // Get user credits
    const credits = await getUserCredits(clerkId);

    // Get user profile for plan info
    let plan = "free";
    if (isConvexConfigured()) {
      const profile = await convex.query(api.users.getByClerkId, { clerkId });
      if (profile) {
        plan = profile.plan;
      }
    }

    // Get transaction history
    const transactions = await getTransactionHistory(clerkId, limit);

    // Get generation history
    const generations = await getGenerationHistory(clerkId, limit);

    // Calculate usage stats
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Filter by period if needed
    const filterByPeriod = <T extends { _creationTime: number }>(items: T[]): T[] => {
      if (period === "week") {
        return items.filter((item) => item._creationTime >= oneWeekAgo);
      } else if (period === "month") {
        return items.filter((item) => item._creationTime >= oneMonthAgo);
      }
      return items;
    };

    const filteredTransactions: CreditTransaction[] = filterByPeriod(transactions);
    const filteredGenerations: Generation[] = filterByPeriod(generations);

    // Calculate totals
    const creditsUsed = filteredTransactions
      .filter((tx) => tx.type === "usage")
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const creditsPurchased = filteredTransactions
      .filter((tx) => tx.type === "purchase" || tx.type === "bonus" || tx.type === "signup")
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Group generations by tool type
    const generationsByTool: Record<string, number> = {};
    filteredGenerations.forEach((gen) => {
      generationsByTool[gen.toolType] = (generationsByTool[gen.toolType] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        account: {
          credits_balance: credits,
          plan,
          is_unlimited: plan === "unlimited",
        },
        usage: {
          period,
          total_generations: filteredGenerations.length,
          credits_used: creditsUsed,
          credits_purchased: creditsPurchased,
          generations_by_tool: generationsByTool,
        },
        recent_transactions: filteredTransactions.slice(0, 10).map((tx) => ({
          id: tx._id,
          amount: tx.amount,
          type: tx.type,
          description: tx.description || null,
          tool_type: tx.toolType || null,
          created_at: new Date(tx._creationTime).toISOString(),
        })),
        recent_generations: filteredGenerations.slice(0, 10).map((gen) => ({
          id: gen._id,
          tool_type: gen.toolType,
          title: gen.title || null,
          credits_used: gen.creditsUsed,
          created_at: new Date(gen._creationTime).toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("API v1 Usage error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}
