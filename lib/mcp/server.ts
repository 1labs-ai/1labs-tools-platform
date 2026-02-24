/**
 * MCP Server Logic for 1Labs Tools Platform
 * 
 * Implements the Model Context Protocol (MCP) for exposing 1Labs tools
 * to external AI agents. Supports both HTTP and stdio transports.
 */

import OpenAI from "openai";
import { MCP_TOOLS, MCP_RESOURCES, getToolByName, validateToolInput, MCPTool } from "./tools";
import { getUserCredits, deductCredits, saveGeneration, getGenerationHistory } from "@/lib/credits";

// MCP Protocol Types
export interface MCPRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// MCP Error Codes
export const MCPErrorCodes = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  // Custom error codes
  AUTHENTICATION_ERROR: -32000,
  INSUFFICIENT_CREDITS: -32001,
  RATE_LIMITED: -32002,
};

// Server context for handling requests
export interface MCPServerContext {
  clerkId: string;
  openai: OpenAI;
}

// Main MCP request handler
export async function handleMCPRequest(
  request: MCPRequest,
  context: MCPServerContext
): Promise<MCPResponse> {
  const { id, method, params } = request;

  try {
    switch (method) {
      case "initialize":
        return createResponse(id, {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "1labs-tools",
            version: "1.0.0",
          },
          capabilities: {
            tools: {},
            resources: {},
          },
        });

      case "tools/list":
        return createResponse(id, {
          tools: MCP_TOOLS.map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema,
          })),
        });

      case "tools/call":
        return await handleToolCall(id, params as { name: string; arguments: Record<string, unknown> }, context);

      case "resources/list":
        return createResponse(id, {
          resources: MCP_RESOURCES,
        });

      case "resources/read":
        return await handleResourceRead(id, params as { uri: string }, context);

      case "ping":
        return createResponse(id, { status: "ok" });

      default:
        return createErrorResponse(id, MCPErrorCodes.METHOD_NOT_FOUND, `Unknown method: ${method}`);
    }
  } catch (error) {
    console.error("MCP request error:", error);
    return createErrorResponse(
      id,
      MCPErrorCodes.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Internal server error"
    );
  }
}

// Handle tool calls
async function handleToolCall(
  id: string | number,
  params: { name: string; arguments: Record<string, unknown> },
  context: MCPServerContext
): Promise<MCPResponse> {
  const { name, arguments: args } = params;

  // Find the tool
  const tool = getToolByName(name);
  if (!tool) {
    return createErrorResponse(id, MCPErrorCodes.METHOD_NOT_FOUND, `Unknown tool: ${name}`);
  }

  // Validate input
  const validation = validateToolInput(tool, args);
  if (!validation.valid) {
    return createErrorResponse(
      id,
      MCPErrorCodes.INVALID_PARAMS,
      `Invalid parameters: ${validation.errors.join(", ")}`
    );
  }

  // Check credits
  const currentCredits = await getUserCredits(context.clerkId);
  if (currentCredits < tool.credits) {
    return createErrorResponse(
      id,
      MCPErrorCodes.INSUFFICIENT_CREDITS,
      `Insufficient credits. Required: ${tool.credits}, Available: ${currentCredits}`,
      { credits_required: tool.credits, credits_available: currentCredits }
    );
  }

  // Execute the tool
  const result = await executeToolCall(tool, args, context);

  // Save generation and deduct credits
  const generation = await saveGeneration(
    context.clerkId,
    tool.toolType,
    result.title || tool.name,
    args,
    result.data,
    tool.credits
  );

  await deductCredits(context.clerkId, tool.toolType, generation.id);

  return createResponse(id, {
    content: [
      {
        type: "text",
        text: JSON.stringify(result.data, null, 2),
      },
    ],
    metadata: {
      generation_id: generation.id,
      credits_used: tool.credits,
    },
  });
}

// Execute a tool and return the result
async function executeToolCall(
  tool: MCPTool,
  args: Record<string, unknown>,
  context: MCPServerContext
): Promise<{ title: string | null; data: Record<string, unknown> }> {
  switch (tool.name) {
    case "generate_roadmap":
      return await generateRoadmap(args.productDescription as string, context);
    
    case "generate_pitch_deck":
      return await generatePitchDeck(args as { companyName: string; description: string; stage?: string; industry?: string }, context);
    
    case "generate_persona":
      return await generatePersona(args as { productDescription: string; personaCount?: string; targetMarket?: string }, context);
    
    case "generate_competitive_analysis":
      return await generateCompetitiveAnalysis(args as { productDescription: string; competitors?: string; industry?: string }, context);
    
    default:
      throw new Error(`Tool not implemented: ${tool.name}`);
  }
}

// Tool implementations
async function generateRoadmap(
  productDescription: string,
  context: MCPServerContext
): Promise<{ title: string | null; data: Record<string, unknown> }> {
  const prompt = `You are a product management expert. Generate a detailed product roadmap for the following product:

"${productDescription}"

Create a roadmap with 6-8 items spread across the next 4 quarters (Q1-Q4 2025). Include a mix of features, improvements, and infrastructure work.

Respond with a JSON object in this exact format:
{
  "productName": "Name of the product",
  "vision": "A one-sentence vision statement",
  "items": [
    {
      "quarter": "Q1 2025",
      "title": "Feature or milestone name",
      "description": "Brief description of what will be delivered",
      "status": "planned"
    }
  ]
}

Make the first 1-2 items "in-progress", the rest "planned". Be specific and actionable.`;

  const completion = await context.openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const roadmap = JSON.parse(content);
  return { title: roadmap.productName, data: { roadmap } };
}

async function generatePitchDeck(
  args: { companyName: string; description: string; stage?: string; industry?: string },
  context: MCPServerContext
): Promise<{ title: string | null; data: Record<string, unknown> }> {
  const prompt = `You are a startup pitch deck expert. Generate a comprehensive pitch deck for:

Company: ${args.companyName}
Description: ${args.description}
${args.stage ? `Stage: ${args.stage}` : ""}
${args.industry ? `Industry: ${args.industry}` : ""}

Create a pitch deck with the following slides:
1. Title/Overview
2. Problem
3. Solution
4. Market Opportunity
5. Business Model
6. Traction (hypothetical if early stage)
7. Competition
8. Team (placeholder)
9. Financials/Ask
10. Contact

Respond with a JSON object:
{
  "companyName": "Company Name",
  "tagline": "One-line description",
  "slides": [
    {
      "title": "Slide title",
      "content": "Main content for the slide",
      "bulletPoints": ["Point 1", "Point 2"],
      "notes": "Speaker notes"
    }
  ]
}`;

  const completion = await context.openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const pitchDeck = JSON.parse(content);
  return { title: `${args.companyName} Pitch Deck`, data: { pitchDeck } };
}

async function generatePersona(
  args: { productDescription: string; personaCount?: string; targetMarket?: string },
  context: MCPServerContext
): Promise<{ title: string | null; data: Record<string, unknown> }> {
  const count = parseInt(args.personaCount || "3", 10);
  
  const prompt = `You are a UX research expert. Generate ${count} detailed user personas for the following product:

"${args.productDescription}"

${args.targetMarket ? `Focus on this target market: ${args.targetMarket}` : ""}

For each persona, include:
- Name, age, occupation, location
- Background story
- Goals and motivations
- Pain points and frustrations
- Tech savviness
- Preferred channels
- Quote that represents them

Respond with a JSON object:
{
  "productName": "Product this is for",
  "personas": [
    {
      "name": "Full Name",
      "age": 32,
      "occupation": "Job Title",
      "location": "City, Country",
      "avatar": "Description for avatar",
      "background": "2-3 sentence background",
      "goals": ["Goal 1", "Goal 2"],
      "painPoints": ["Pain 1", "Pain 2"],
      "techSavviness": "high/medium/low",
      "preferredChannels": ["Channel 1", "Channel 2"],
      "quote": "A quote that represents this persona"
    }
  ]
}`;

  const completion = await context.openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const personas = JSON.parse(content);
  return { title: "User Personas", data: { personas } };
}

async function generateCompetitiveAnalysis(
  args: { productDescription: string; competitors?: string; industry?: string },
  context: MCPServerContext
): Promise<{ title: string | null; data: Record<string, unknown> }> {
  const prompt = `You are a market research expert. Generate a competitive analysis for:

Product: ${args.productDescription}
${args.competitors ? `Competitors to analyze: ${args.competitors}` : "Identify the top 3-5 competitors"}
${args.industry ? `Industry: ${args.industry}` : ""}

Include:
1. Market overview
2. Competitor profiles (3-5)
3. Feature comparison matrix
4. Positioning map
5. Strengths/Weaknesses/Opportunities/Threats
6. Key differentiators
7. Recommendations

Respond with a JSON object:
{
  "productName": "Your product",
  "marketOverview": "2-3 sentence market overview",
  "competitors": [
    {
      "name": "Competitor Name",
      "description": "What they do",
      "pricing": "Pricing model",
      "strengths": ["Strength 1"],
      "weaknesses": ["Weakness 1"],
      "marketPosition": "Leader/Challenger/Niche"
    }
  ],
  "featureComparison": {
    "features": ["Feature 1", "Feature 2"],
    "comparison": {
      "Your Product": [true, false],
      "Competitor 1": [true, true]
    }
  },
  "swot": {
    "strengths": ["S1"],
    "weaknesses": ["W1"],
    "opportunities": ["O1"],
    "threats": ["T1"]
  },
  "recommendations": ["Recommendation 1"]
}`;

  const completion = await context.openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const analysis = JSON.parse(content);
  return { title: "Competitive Analysis", data: { analysis } };
}

// Handle resource reads
async function handleResourceRead(
  id: string | number,
  params: { uri: string },
  context: MCPServerContext
): Promise<MCPResponse> {
  const { uri } = params;

  switch (uri) {
    case "user://credits": {
      const credits = await getUserCredits(context.clerkId);
      return createResponse(id, {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify({ credits }),
          },
        ],
      });
    }

    case "generations://history": {
      const history = await getGenerationHistory(context.clerkId, 50);
      return createResponse(id, {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify({ generations: history }),
          },
        ],
      });
    }

    default:
      return createErrorResponse(id, MCPErrorCodes.INVALID_PARAMS, `Unknown resource: ${uri}`);
  }
}

// Helper functions
function createResponse(id: string | number, result: unknown): MCPResponse {
  return { jsonrpc: "2.0", id, result };
}

function createErrorResponse(
  id: string | number,
  code: number,
  message: string,
  data?: unknown
): MCPResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: { code, message, ...(data ? { data } : {}) },
  };
}
