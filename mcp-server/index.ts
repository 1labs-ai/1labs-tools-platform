#!/usr/bin/env node

/**
 * 1Labs Tools MCP Server
 * 
 * Model Context Protocol server for 1Labs AI Tools.
 * Exposes tools for generating roadmaps, PRDs, pitch decks, and personas.
 * 
 * Usage:
 *   npx @1labs/mcp-tools
 * 
 * Environment:
 *   ONELABS_API_KEY - Your 1Labs API key (get from https://1labs.ai/account/api-keys)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

// API Configuration
const API_BASE_URL = process.env.ONELABS_API_URL || "https://1labs.ai";
const API_KEY = process.env.ONELABS_API_KEY;

// Tool definitions
const TOOLS = [
  {
    name: "roadmap_generator",
    description: "Generate a detailed product roadmap with quarterly milestones, features, and progress tracking. Creates 6-8 items spread across Q1-Q4 with clear deliverables.",
    inputSchema: {
      type: "object" as const,
      properties: {
        productDescription: {
          type: "string",
          description: "A description of the product to generate a roadmap for. Be specific about features, target users, and goals. (min 10 chars)",
        },
      },
      required: ["productDescription"],
    },
  },
  {
    name: "prd_generator",
    description: "Generate a comprehensive Product Requirements Document (PRD) with problem analysis, user personas, feature breakdown, technical considerations, and success metrics.",
    inputSchema: {
      type: "object" as const,
      properties: {
        productDescription: {
          type: "string",
          description: "Description of the product including problem it solves, target users, and key features",
        },
        includeUserStories: {
          type: "boolean",
          description: "Whether to include detailed user stories (default: true)",
        },
        includeTechSpecs: {
          type: "boolean",
          description: "Whether to include technical specifications (default: false)",
        },
      },
      required: ["productDescription"],
    },
  },
  {
    name: "pitch_deck_generator",
    description: "Generate a comprehensive pitch deck for startups and products. Includes problem/solution, market analysis, business model, team, and financials slides.",
    inputSchema: {
      type: "object" as const,
      properties: {
        companyName: {
          type: "string",
          description: "Name of the company or product",
        },
        description: {
          type: "string",
          description: "Description of what the company does, the problem it solves, and its value proposition",
        },
        stage: {
          type: "string",
          enum: ["idea", "mvp", "seed", "series_a", "growth"],
          description: "Current stage of the company",
        },
        industry: {
          type: "string",
          description: "Primary industry or sector",
        },
      },
      required: ["companyName", "description"],
    },
  },
  {
    name: "persona_generator",
    description: "Generate detailed user personas for product development. Creates realistic user profiles with demographics, goals, pain points, and behaviors.",
    inputSchema: {
      type: "object" as const,
      properties: {
        productDescription: {
          type: "string",
          description: "Description of the product to create personas for",
        },
        personaCount: {
          type: "number",
          description: "Number of personas to generate (1-5, default: 3)",
          minimum: 1,
          maximum: 5,
        },
        targetMarket: {
          type: "string",
          description: "Specific target market or user segment to focus on",
        },
      },
      required: ["productDescription"],
    },
  },
];

// Resource definitions
const RESOURCES = [
  {
    uri: "1labs://credits",
    name: "Credit Balance",
    description: "Check your current credit balance",
    mimeType: "application/json",
  },
  {
    uri: "1labs://generations",
    name: "Generation History",
    description: "List your past generations",
    mimeType: "application/json",
  },
];

// API helper
async function apiRequest(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  if (!API_KEY) {
    return { success: false, error: "ONELABS_API_KEY environment variable not set" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "User-Agent": "1labs-mcp-server/1.0.0",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `API error: ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Tool execution
async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  let endpoint: string;
  let body: Record<string, unknown>;

  switch (name) {
    case "roadmap_generator":
      endpoint = "/generate/roadmap";
      body = { productDescription: args.productDescription };
      break;

    case "prd_generator":
      endpoint = "/generate/prd";
      body = {
        productDescription: args.productDescription,
        includeUserStories: args.includeUserStories ?? true,
        includeTechSpecs: args.includeTechSpecs ?? false,
      };
      break;

    case "pitch_deck_generator":
      endpoint = "/generate/pitch-deck";
      body = {
        companyName: args.companyName,
        description: args.description,
        stage: args.stage || "mvp",
        industry: args.industry,
      };
      break;

    case "persona_generator":
      endpoint = "/generate/persona";
      body = {
        productDescription: args.productDescription,
        personaCount: String(args.personaCount || 3),
        targetMarket: args.targetMarket,
      };
      break;

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }

  const result = await apiRequest(endpoint, "POST", body);

  if (!result.success) {
    return {
      content: [{ type: "text", text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  // Format the response
  const data = result.data as Record<string, unknown>;
  
  // Extract the relevant data based on tool type
  let outputData: unknown;
  let metadata = "";

  if (data.roadmap) {
    outputData = data.roadmap;
    metadata = `\n\n---\nGeneration ID: ${data.generationId}\nCredits used: ${data.creditsUsed}`;
  } else if (data.prd) {
    outputData = data.prd;
    metadata = `\n\n---\nGeneration ID: ${data.generationId}\nCredits used: ${data.creditsUsed}`;
  } else if (data.pitchDeck) {
    outputData = data.pitchDeck;
    metadata = `\n\n---\nGeneration ID: ${data.generationId}\nCredits used: ${data.creditsUsed}`;
  } else if (data.personas) {
    outputData = data.personas;
    metadata = `\n\n---\nGeneration ID: ${data.generationId}\nCredits used: ${data.creditsUsed}`;
  } else {
    outputData = data;
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(outputData, null, 2) + metadata,
      },
    ],
  };
}

// Resource reading
async function readResource(uri: string): Promise<string> {
  switch (uri) {
    case "1labs://credits": {
      const result = await apiRequest("/account/credits");
      if (!result.success) {
        throw new McpError(ErrorCode.InternalError, result.error || "Failed to fetch credits");
      }
      return JSON.stringify(result.data, null, 2);
    }

    case "1labs://generations": {
      const result = await apiRequest("/account/generations?limit=20");
      if (!result.success) {
        throw new McpError(ErrorCode.InternalError, result.error || "Failed to fetch generations");
      }
      return JSON.stringify(result.data, null, 2);
    }

    default:
      throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
  }
}

// Create and configure the MCP server
async function main() {
  const server = new Server(
    {
      name: "1labs-tools",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    if (!API_KEY) {
      return {
        content: [
          {
            type: "text",
            text: "Error: ONELABS_API_KEY environment variable not set.\n\nGet your API key from https://1labs.ai/account/api-keys",
          },
        ],
        isError: true,
      };
    }

    return await executeTool(name, args as Record<string, unknown>);
  });

  // List resources handler
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: RESOURCES,
  }));

  // Read resource handler
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    
    if (!API_KEY) {
      throw new McpError(
        ErrorCode.InternalError,
        "ONELABS_API_KEY environment variable not set"
      );
    }

    const content = await readResource(uri);
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: content,
        },
      ],
    };
  });

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP communication)
  console.error("1Labs Tools MCP Server running");
  console.error(`API Key: ${API_KEY ? "configured" : "NOT SET"}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
