import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTransactionHistory, getUsageSummary, getUserPlan } from "@/lib/credits";

/**
 * Get user's usage history and summary
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Get transaction history, summary, and plan
    const [transactions, summary, plan] = await Promise.all([
      getTransactionHistory(userId, limit),
      getUsageSummary(userId),
      getUserPlan(userId),
    ]);

    // Transform transactions for client
    const formattedTransactions = transactions.map(tx => ({
      id: tx._id,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      toolType: tx.toolType,
      createdAt: tx._creationTime,
    }));

    return NextResponse.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        summary: {
          totalCreditsUsed: summary.totalCreditsUsed,
          totalPurchased: summary.totalPurchased,
          generationCount: summary.generationCount,
          byTool: summary.byTool,
        },
        plan,
      },
    });
  } catch (error) {
    console.error("Usage history error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get usage history" },
      { status: 500 }
    );
  }
}
