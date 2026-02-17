import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { getUserCredits, getOrCreateUserProfile, TOOL_CREDITS } from "@/lib/credits";

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

    // Get user profile and credits
    const profile = await getOrCreateUserProfile(clerkId);
    const credits = await getUserCredits(clerkId);

    return NextResponse.json({
      success: true,
      data: {
        credits: credits,
        plan: profile.plan,
        tool_costs: TOOL_CREDITS,
      },
    });
  } catch (error) {
    console.error("API v1 Get credits error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get credits" },
      { status: 500 }
    );
  }
}
