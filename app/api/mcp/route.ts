/**
 * MCP HTTP Endpoint
 * 
 * Exposes the Model Context Protocol (MCP) server over HTTP.
 * This allows AI agents to interact with 1Labs tools via HTTP requests.
 * 
 * Usage:
 * POST /api/mcp
 * Authorization: Bearer 1labs_your_api_key
 * Content-Type: application/json
 * 
 * Body: MCP JSON-RPC request
 * {
 *   "jsonrpc": "2.0",
 *   "id": "1",
 *   "method": "tools/list"
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { validateApiKey } from "@/lib/api-auth";
import { handleMCPRequest, MCPRequest, MCPErrorCodes } from "@/lib/mcp/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Handle MCP requests
export async function POST(request: NextRequest) {
  // Validate API key
  const authHeader = request.headers.get("Authorization");
  const validation = await validateApiKey(authHeader);

  if (!validation.valid) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: 0, // Use 0 instead of null for type compatibility
        error: {
          code: MCPErrorCodes.AUTHENTICATION_ERROR,
          message: validation.error || "Authentication failed",
        },
      },
      { status: 401 }
    );
  }

  // Parse request body
  let mcpRequest: MCPRequest;
  try {
    mcpRequest = await request.json();
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: 0,
        error: {
          code: MCPErrorCodes.PARSE_ERROR,
          message: "Invalid JSON",
        },
      },
      { status: 400 }
    );
  }

  // Validate JSON-RPC format
  if (!mcpRequest.jsonrpc || mcpRequest.jsonrpc !== "2.0" || !mcpRequest.method) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: mcpRequest?.id ?? 0,
        error: {
          code: MCPErrorCodes.INVALID_REQUEST,
          message: "Invalid JSON-RPC 2.0 request",
        },
      },
      { status: 400 }
    );
  }

  // Handle the MCP request
  const response = await handleMCPRequest(mcpRequest, {
    clerkId: validation.clerkId!,
    openai,
  });

  return NextResponse.json(response);
}

// Return server info for GET requests (for discovery)
export async function GET() {
  return NextResponse.json({
    name: "1labs-tools-mcp",
    version: "1.0.0",
    description: "MCP server for 1Labs AI Tools Platform",
    protocol: "MCP 2024-11-05",
    transport: "HTTP",
    authentication: "Bearer token (1Labs API key)",
    endpoints: {
      mcp: "/api/mcp",
      tools_list: "POST /api/mcp with method: tools/list",
      tools_call: "POST /api/mcp with method: tools/call",
      resources_list: "POST /api/mcp with method: resources/list",
      resources_read: "POST /api/mcp with method: resources/read",
    },
    example: {
      request: {
        jsonrpc: "2.0",
        id: "1",
        method: "tools/list",
      },
      curl: `curl -X POST https://tools.1labs.ai/api/mcp \\
  -H "Authorization: Bearer 1labs_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":"1","method":"tools/list"}'`,
    },
  });
}
