/**
 * 1Labs Tools Platform SDK
 * 
 * A TypeScript client for interacting with the 1Labs Tools Platform API.
 * Can be used from the Agents Platform or any other service.
 */

export interface ToolsClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  generation_id?: string;
  credits_used?: number;
  credits_remaining?: number;
}

// Roadmap types
export interface RoadmapItem {
  quarter: string;
  title: string;
  description: string;
  status: "planned" | "in-progress" | "completed";
}

export interface Roadmap {
  productName: string;
  vision: string;
  items: RoadmapItem[];
}

// Pitch Deck types
export interface PitchDeckSlide {
  title: string;
  content: string;
  bulletPoints?: string[];
  notes?: string;
}

export interface PitchDeck {
  companyName: string;
  tagline: string;
  slides: PitchDeckSlide[];
}

// Persona types
export interface Persona {
  name: string;
  age: number;
  occupation: string;
  location: string;
  avatar?: string;
  background: string;
  goals: string[];
  painPoints: string[];
  techSavviness: "high" | "medium" | "low";
  preferredChannels: string[];
  quote: string;
}

export interface PersonaResult {
  productName: string;
  personas: Persona[];
}

// Competitive Analysis types
export interface Competitor {
  name: string;
  description: string;
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  marketPosition: string;
}

export interface CompetitiveAnalysis {
  productName: string;
  marketOverview: string;
  competitors: Competitor[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendations: string[];
}

// User/Credits types
export interface UserCredits {
  credits: number;
  plan: "free" | "starter" | "pro" | "unlimited";
}

// Generation types
export interface Generation {
  id: string;
  tool_type: string;
  title: string;
  credits_used: number;
  created_at: number;
}

/**
 * 1Labs Tools Platform Client
 */
export class ToolsClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: ToolsClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://tools.1labs.ai/api/v1";
    this.timeout = config.timeout || 60000;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === "AbortError") {
        return { success: false, error: "Request timeout" };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ============ Roadmap ============

  async generateRoadmap(params: {
    productDescription: string;
  }): Promise<APIResponse<{ roadmap: Roadmap }>> {
    return this.request<{ roadmap: Roadmap }>("/roadmap", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // ============ Pitch Deck ============

  async generatePitchDeck(params: {
    companyName: string;
    description: string;
    stage?: "idea" | "mvp" | "seed" | "series_a" | "growth";
    industry?: string;
  }): Promise<APIResponse<{ pitchDeck: PitchDeck }>> {
    return this.request<{ pitchDeck: PitchDeck }>("/pitch-deck", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // ============ Persona ============

  async generatePersona(params: {
    productDescription: string;
    personaCount?: number;
    targetMarket?: string;
  }): Promise<APIResponse<{ personas: PersonaResult }>> {
    return this.request<{ personas: PersonaResult }>("/persona", {
      method: "POST",
      body: JSON.stringify({
        ...params,
        personaCount: params.personaCount?.toString(),
      }),
    });
  }

  // ============ Competitive Analysis ============

  async generateCompetitiveAnalysis(params: {
    productDescription: string;
    competitors?: string;
    industry?: string;
  }): Promise<APIResponse<{ analysis: CompetitiveAnalysis }>> {
    return this.request<{ analysis: CompetitiveAnalysis }>("/competitive-analysis", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // ============ User & Credits ============

  async getCredits(): Promise<APIResponse<UserCredits>> {
    return this.request<UserCredits>("/user/credits", {
      method: "GET",
    });
  }

  async getGenerations(params?: {
    limit?: number;
    toolType?: string;
  }): Promise<APIResponse<{ generations: Generation[] }>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.toolType) searchParams.set("tool_type", params.toolType);
    
    const query = searchParams.toString();
    return this.request<{ generations: Generation[] }>(
      `/generations${query ? `?${query}` : ""}`
    );
  }

  // ============ MCP ============

  async mcpRequest(method: string, params?: Record<string, unknown>): Promise<{
    jsonrpc: "2.0";
    id: string;
    result?: unknown;
    error?: { code: number; message: string };
  }> {
    const response = await fetch(`${this.baseUrl.replace("/api/v1", "/api/mcp")}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now().toString(),
        method,
        params,
      }),
    });

    return response.json();
  }

  async listMCPTools(): Promise<unknown[]> {
    const response = await this.mcpRequest("tools/list");
    if (response.error) throw new Error(response.error.message);
    return (response.result as { tools: unknown[] }).tools;
  }

  async callMCPTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const response = await this.mcpRequest("tools/call", { name, arguments: args });
    if (response.error) throw new Error(response.error.message);
    return response.result;
  }
}

// Export a factory function
export function createToolsClient(config: ToolsClientConfig): ToolsClient {
  return new ToolsClient(config);
}
