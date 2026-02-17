import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createApiKey, listApiKeys } from "@/lib/api-auth";

// Create a new API key (requires Clerk auth, not API key auth)
export async function POST(request: NextRequest) {
  try {
    // Use Clerk auth for creating API keys (users must be logged in via web)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Please sign in to create an API key" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || name.length < 1 || name.length > 50) {
      return NextResponse.json(
        { success: false, error: "API key name must be 1-50 characters" },
        { status: 400 }
      );
    }

    const result = await createApiKey(userId, name);

    if ("error" in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        api_key: result.apiKey, // Only shown once!
        key_info: {
          id: result.keyData.id,
          name: result.keyData.name,
          prefix: result.keyData.key_prefix,
          created_at: result.keyData.created_at,
        },
      },
      message: "Save this API key - it won't be shown again!",
    });
  } catch (error) {
    console.error("API v1 Create API key error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create API key" },
      { status: 500 }
    );
  }
}

// List user's API keys (requires Clerk auth)
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Please sign in to view API keys" },
        { status: 401 }
      );
    }

    const keys = await listApiKeys(userId);

    return NextResponse.json({
      success: true,
      data: {
        api_keys: keys.map((k) => ({
          id: k.id,
          name: k.name,
          prefix: k.key_prefix,
          last_used_at: k.last_used_at,
          created_at: k.created_at,
        })),
      },
    });
  } catch (error) {
    console.error("API v1 List API keys error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list API keys" },
      { status: 500 }
    );
  }
}
