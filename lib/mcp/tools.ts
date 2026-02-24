/**
 * MCP Tool Definitions for 1Labs Tools Platform
 * 
 * These tools are exposed via the Model Context Protocol (MCP) to allow
 * external AI agents to use 1Labs tools programmatically.
 */

import { TOOL_CREDITS, ToolType } from "@/lib/credits";

// MCP Tool Schema Types
export interface MCPToolInputSchema {
  type: "object";
  properties: Record<string, {
    type: string;
    description: string;
    minLength?: number;
    maxLength?: number;
    enum?: string[];
  }>;
  required: string[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: MCPToolInputSchema;
  credits: number;
  toolType: ToolType;
}

// Tool definitions for MCP exposure
export const MCP_TOOLS: MCPTool[] = [
  {
    name: "generate_roadmap",
    description: "Generate a detailed product roadmap with quarterly milestones, features, and progress tracking. Creates 6-8 items spread across Q1-Q4 2025 with clear deliverables.",
    inputSchema: {
      type: "object",
      properties: {
        productDescription: {
          type: "string",
          description: "A description of the product to generate a roadmap for. Be specific about features, target users, and goals.",
          minLength: 10,
          maxLength: 5000,
        },
      },
      required: ["productDescription"],
    },
    credits: TOOL_CREDITS.roadmap,
    toolType: "roadmap",
  },
  {
    name: "generate_pitch_deck",
    description: "Generate a comprehensive pitch deck for startups and products. Includes problem/solution, market analysis, business model, team, and financials slides.",
    inputSchema: {
      type: "object",
      properties: {
        companyName: {
          type: "string",
          description: "Name of the company or product",
          minLength: 1,
          maxLength: 100,
        },
        description: {
          type: "string",
          description: "Description of what the company does, the problem it solves, and its value proposition",
          minLength: 20,
          maxLength: 5000,
        },
        stage: {
          type: "string",
          description: "Current stage of the company",
          enum: ["idea", "mvp", "seed", "series_a", "growth"],
        },
        industry: {
          type: "string",
          description: "Primary industry or sector",
          maxLength: 100,
        },
      },
      required: ["companyName", "description"],
    },
    credits: TOOL_CREDITS.pitch_deck,
    toolType: "pitch_deck",
  },
  {
    name: "generate_persona",
    description: "Generate detailed user personas for product development. Creates realistic user profiles with demographics, goals, pain points, and behaviors.",
    inputSchema: {
      type: "object",
      properties: {
        productDescription: {
          type: "string",
          description: "Description of the product to create personas for",
          minLength: 10,
          maxLength: 5000,
        },
        personaCount: {
          type: "string",
          description: "Number of personas to generate (1-5)",
          enum: ["1", "2", "3", "4", "5"],
        },
        targetMarket: {
          type: "string",
          description: "Optional: Specific target market or user segment to focus on",
          maxLength: 500,
        },
      },
      required: ["productDescription"],
    },
    credits: TOOL_CREDITS.persona,
    toolType: "persona",
  },
  {
    name: "generate_competitive_analysis",
    description: "Generate a competitive analysis comparing your product to competitors. Includes feature comparison, positioning, strengths/weaknesses, and market opportunities.",
    inputSchema: {
      type: "object",
      properties: {
        productDescription: {
          type: "string",
          description: "Description of your product",
          minLength: 10,
          maxLength: 5000,
        },
        competitors: {
          type: "string",
          description: "Comma-separated list of competitor names to analyze",
          maxLength: 500,
        },
        industry: {
          type: "string",
          description: "Industry or market segment",
          maxLength: 100,
        },
      },
      required: ["productDescription"],
    },
    credits: TOOL_CREDITS.competitive_analysis,
    toolType: "competitive_analysis",
  },
];

// MCP Resources
export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export const MCP_RESOURCES: MCPResource[] = [
  {
    uri: "user://credits",
    name: "Credit Balance",
    description: "Current credit balance for the authenticated user",
    mimeType: "application/json",
  },
  {
    uri: "generations://history",
    name: "Generation History",
    description: "List of past tool generations for the user",
    mimeType: "application/json",
  },
];

// Get tool by name
export function getToolByName(name: string): MCPTool | undefined {
  return MCP_TOOLS.find((t) => t.name === name);
}

// Validate tool input against schema
export function validateToolInput(
  tool: MCPTool,
  input: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  for (const field of tool.inputSchema.required) {
    if (!(field in input) || input[field] === undefined || input[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check field constraints
  for (const [fieldName, fieldSchema] of Object.entries(tool.inputSchema.properties)) {
    const value = input[fieldName];
    
    if (value === undefined || value === null) continue;

    if (fieldSchema.type === "string" && typeof value === "string") {
      if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
        errors.push(`${fieldName} must be at least ${fieldSchema.minLength} characters`);
      }
      if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
        errors.push(`${fieldName} must be at most ${fieldSchema.maxLength} characters`);
      }
      if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
        errors.push(`${fieldName} must be one of: ${fieldSchema.enum.join(", ")}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
