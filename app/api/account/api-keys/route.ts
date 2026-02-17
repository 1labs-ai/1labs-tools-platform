import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { 
  createApiKey, 
  listApiKeys, 
  revokeApiKey 
} from '@/lib/api-keys';

/**
 * GET /api/account/api-keys
 * List all API keys for the authenticated user
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const apiKeys = await listApiKeys(userId);

    return NextResponse.json({
      apiKeys: apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        keyPrefix: key.key_prefix,
        createdAt: key.created_at,
        lastUsedAt: key.last_used_at,
      })),
    });
  } catch (error) {
    console.error('Error listing API keys:', error);
    return NextResponse.json(
      { error: 'Failed to list API keys' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/account/api-keys
 * Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'API key name must be 100 characters or less' },
        { status: 400 }
      );
    }

    const { apiKey, fullKey } = await createApiKey(userId, name);

    return NextResponse.json({
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.key_prefix,
        createdAt: apiKey.created_at,
        lastUsedAt: apiKey.last_used_at,
      },
      // Full key is only returned once at creation
      fullKey,
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/account/api-keys
 * Revoke an API key
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      );
    }

    await revokeApiKey(userId, keyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
