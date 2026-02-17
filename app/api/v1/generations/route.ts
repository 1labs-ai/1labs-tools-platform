import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { getGenerationHistory, ToolType } from "@/lib/credits";

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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const toolType = searchParams.get("tool_type") as ToolType | null;

    // Get generations
    const generations = await getGenerationHistory(
      clerkId,
      limit,
      toolType || undefined
    );

    return NextResponse.json({
      success: true,
      data: {
        generations,
        count: generations.length,
      },
    });
  } catch (error) {
    console.error("API v1 List generations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list generations" },
      { status: 500 }
    );
  }
}
