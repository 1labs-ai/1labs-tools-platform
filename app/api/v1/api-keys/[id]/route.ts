import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revokeApiKey } from "@/lib/api-auth";

// Revoke an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Use Clerk auth for revoking API keys
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Please sign in to revoke an API key" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "API key ID is required" },
        { status: 400 }
      );
    }

    const result = await revokeApiKey(userId, id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to revoke API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "API key revoked successfully",
    });
  } catch (error) {
    console.error("API v1 Revoke API key error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to revoke API key" },
      { status: 500 }
    );
  }
}
