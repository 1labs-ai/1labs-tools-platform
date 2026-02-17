# 1Labs AI Platform — Launch Readiness Plan

**Version:** 1.0  
**Date:** February 18, 2026  
**Author:** Ariv

---

## Executive Summary

This document outlines the complete roadmap for making **tools.1labs.ai** and **agents.1labs.ai** launch-ready, based on competitive research of Jasper.ai, Copy.ai, Relevance AI, and LangSmith.

---

## Part 1: Competitive Landscape Analysis

### Key Competitors Analyzed

| Platform | Focus | Pricing Model | Key Features |
|----------|-------|---------------|--------------|
| **Jasper.ai** | Marketing content | $59-69/seat/mo + Enterprise | Brand voice, templates, API, agents |
| **Copy.ai** | GTM automation | Seats + Credits ($1K-3K/mo) | Workflows, multi-model, API |
| **Relevance AI** | AI workforce/agents | Enterprise | No-code agent builder, integrations |
| **LangSmith** | Observability | Usage-based | Tracing, monitoring, evals |

### Key Insights

1. **Credit-based pricing is standard** — Users understand "credits" for generations
2. **API access is a premium feature** — Reserved for paid/business tiers
3. **Agents are the next frontier** — Both Jasper and Relevance are pushing "AI agents"
4. **Documentation is expected** — All platforms have comprehensive API docs
5. **Enterprise features sell** — SSO, RBAC, team management, analytics

---

## Part 2: tools.1labs.ai — What We Need

### ✅ Already Built
- [ ] User authentication (Clerk)
- [ ] Credit-based pricing tiers
- [ ] AI Product Roadmap tool
- [ ] PRD Agent tool
- [ ] Basic header/footer/branding

### 🔨 Core Features Needed

#### 2.1 User Dashboard (`/dashboard`)
```
- Credits balance (prominent)
- Recent generations history
- Saved outputs
- Usage analytics (graphs)
- Quick actions to tools
```

#### 2.2 Generation History (`/history`)
```
- All past generations
- Filter by tool type
- Search by content
- Re-run / duplicate
- Export (JSON, Markdown, PDF)
```

#### 2.3 Credit System (Backend)
```
- Database: credits table linked to user
- Deduct on successful generation
- Webhook for Stripe to add credits
- Credit purchase flow
- Usage tracking per tool
```

#### 2.4 API Access (`/api/v1/...`)
```
POST /api/v1/roadmap/generate
POST /api/v1/prd/generate
POST /api/v1/pitch-deck/generate
POST /api/v1/persona/generate

Headers:
  Authorization: Bearer <api_key>
  
Response:
  { success, data, credits_used, credits_remaining }
```

#### 2.5 API Documentation (`/docs`)
```
- Interactive API explorer (Swagger/OpenAPI)
- Code examples (curl, Python, Node.js)
- Authentication guide
- Rate limits documentation
- Webhooks documentation
```

#### 2.6 API Key Management (`/account/api`)
```
- Generate API keys
- Revoke keys
- Key usage stats
- Rate limit display
```

#### 2.7 Additional Tools
```
1. Pitch Deck Generator (15 credits)
2. User Persona Builder (5 credits)
3. Competitive Analysis (10 credits)
4. GTM Strategy Generator (10 credits)
5. Feature Spec Writer (8 credits)
```

#### 2.8 Team Features (Future)
```
- Invite team members
- Shared credit pool
- Role-based access
- Team usage analytics
```

---

## Part 3: agents.1labs.ai — AI Agent Marketplace

### Vision
A platform where users can "hire" pre-trained AI agents for specific tasks. Agents come with pre-configured tools (MCP protocol) and can be accessed via UI or API.

### 3.1 Agent Categories

| Category | Example Agents | Use Case |
|----------|---------------|----------|
| **Sales** | Lead Qualifier, Outreach Writer, CRM Updater | SDR automation |
| **Marketing** | Content Writer, SEO Optimizer, Social Manager | Content at scale |
| **Product** | PRD Writer, Roadmap Planner, User Researcher | PM workflows |
| **Engineering** | Code Reviewer, Doc Writer, Bug Triager | Dev productivity |
| **Support** | Ticket Responder, FAQ Builder, Escalation Router | Customer success |

### 3.2 Agent Structure

```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  
  // Capabilities
  tools: MCPTool[];           // MCP-compatible tools
  systemPrompt: string;       // Agent personality/instructions
  model: string;              // gpt-4, claude-3, etc.
  
  // Pricing
  pricePerRun: number;        // Credits per execution
  pricePerMinute?: number;    // For long-running agents
  
  // Metadata
  rating: number;
  totalRuns: number;
  createdBy: string;          // "1labs" or user ID
  isPublic: boolean;
}
```

### 3.3 MCP Integration

```typescript
interface MCPTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  handler: string;            // API endpoint or function
}

// Example: Web Search Tool
{
  name: "web_search",
  description: "Search the web for information",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" }
    }
  },
  handler: "/api/mcp/web-search"
}
```

### 3.4 Agent Marketplace Features

```
Homepage (/):
  - Featured agents
  - Categories grid
  - Search bar
  - "New agents" section

Agent Detail (/agent/:id):
  - Description & capabilities
  - Tools list
  - Pricing
  - Reviews/ratings
  - "Hire Agent" CTA
  - API documentation

Run Agent (/agent/:id/run):
  - Input form (based on agent schema)
  - Real-time execution logs
  - Output display
  - Credit deduction

My Agents (/my-agents):
  - Agents I've hired/used
  - Favorites
  - Custom agents I've built

Build Agent (/build):
  - No-code agent builder
  - Select base model
  - Add tools from library
  - Set system prompt
  - Test & publish
```

### 3.5 API for Agents

```
POST /api/v1/agents/:id/run
{
  "input": { ... },
  "stream": true|false,
  "webhook": "https://..."
}

Response:
{
  "run_id": "...",
  "status": "running|completed|failed",
  "output": { ... },
  "credits_used": 10,
  "execution_time_ms": 1234
}

GET /api/v1/agents/:id/runs/:run_id
GET /api/v1/agents/:id/runs (list all runs)
```

---

## Part 4: Shared Infrastructure

### 4.1 Database Schema

```sql
-- Users (managed by Clerk, but we store extra data)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  clerk_id VARCHAR UNIQUE,
  credits INT DEFAULT 25,
  plan VARCHAR DEFAULT 'free',
  created_at TIMESTAMP
);

-- Credit Transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles,
  amount INT,
  type VARCHAR, -- 'purchase', 'usage', 'bonus', 'refund'
  tool_id VARCHAR,
  agent_id VARCHAR,
  created_at TIMESTAMP
);

-- Generations (Tools)
CREATE TABLE generations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles,
  tool_type VARCHAR, -- 'roadmap', 'prd', etc.
  input JSONB,
  output JSONB,
  credits_used INT,
  created_at TIMESTAMP
);

-- Agent Runs
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles,
  agent_id VARCHAR,
  input JSONB,
  output JSONB,
  status VARCHAR,
  credits_used INT,
  execution_time_ms INT,
  created_at TIMESTAMP
);

-- API Keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles,
  key_hash VARCHAR,
  name VARCHAR,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP,
  revoked_at TIMESTAMP
);

-- Agents (for marketplace)
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  category VARCHAR,
  system_prompt TEXT,
  model VARCHAR,
  tools JSONB,
  price_per_run INT,
  created_by UUID REFERENCES user_profiles,
  is_public BOOLEAN,
  rating DECIMAL,
  total_runs INT,
  created_at TIMESTAMP
);
```

### 4.2 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14+, Tailwind CSS |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| Payments | Stripe |
| AI Models | OpenAI, Anthropic (via API) |
| Hosting | Vercel |
| Analytics | PostHog or Mixpanel |
| Docs | Mintlify or Docusaurus |

### 4.3 API Rate Limits

| Plan | Requests/min | Requests/day |
|------|-------------|--------------|
| Free | 10 | 100 |
| Starter | 30 | 1,000 |
| Pro | 60 | 5,000 |
| Unlimited | 120 | Unlimited |

---

## Part 5: Launch Checklist

### Phase 1: Core Platform (Week 1-2)
- [ ] Set up Supabase database
- [ ] Implement credit system with transactions
- [ ] Build user dashboard
- [ ] Add generation history
- [ ] Connect Stripe for credit purchases
- [ ] Deploy updated tools.1labs.ai

### Phase 2: API & Docs (Week 3)
- [ ] Build API endpoints for all tools
- [ ] Implement API key management
- [ ] Create API documentation site
- [ ] Add rate limiting
- [ ] Test API thoroughly

### Phase 3: Additional Tools (Week 4)
- [ ] Pitch Deck Generator
- [ ] User Persona Builder
- [ ] Competitive Analysis tool
- [ ] Polish all existing tools

### Phase 4: agents.1labs.ai MVP (Week 5-6)
- [ ] Set up agents.1labs.ai domain
- [ ] Build agent marketplace UI
- [ ] Create 5-10 pre-built agents
- [ ] Implement agent execution engine
- [ ] Add MCP tool integration
- [ ] Agent API endpoints

### Phase 5: Polish & Launch (Week 7-8)
- [ ] Security audit
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Create launch content
- [ ] Beta user feedback
- [ ] Public launch

---

## Part 6: Pricing Strategy

### tools.1labs.ai

| Plan | Price | Credits | Features |
|------|-------|---------|----------|
| **Free** | $0 | 25 one-time | All tools, basic support |
| **Starter** | $9/mo | 100/mo | All tools, email support, rollover |
| **Pro** | $29/mo | 500/mo | All tools, priority support, API access |
| **Unlimited** | $79/mo | Unlimited | Everything + custom integrations |

### agents.1labs.ai

| Plan | Price | Included | API |
|------|-------|----------|-----|
| **Free** | $0 | 50 credits | No |
| **Growth** | $29/mo | 500 credits | Yes |
| **Scale** | $99/mo | 2000 credits | Yes + priority |
| **Enterprise** | Custom | Custom | Dedicated support |

### Credit Costs

| Action | Credits |
|--------|---------|
| Roadmap generation | 5 |
| PRD generation | 10 |
| Pitch deck | 15 |
| User persona | 5 |
| Agent run (varies) | 2-20 |

---

## Part 7: Validation & Risks

### Validation Strategy
1. **Soft launch** to existing 1Labs clients
2. **ProductHunt launch** for initial traction
3. **Content marketing** via LinkedIn and blog
4. **Partner with accelerators** for startup users

### Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low adoption | High | Free tier, content marketing |
| API abuse | Medium | Rate limiting, monitoring |
| Model costs | Medium | Caching, efficient prompts |
| Competition | Medium | Focus on product teams niche |

---

## Conclusion

The 1Labs AI Platform (Tools + Agents) is positioned to serve **product teams and founders** with specialized AI tools. The credit-based model is proven, API access creates stickiness, and the agent marketplace is a differentiating future bet.

**Recommended Priority:**
1. Ship tools.1labs.ai with credits + API (4 weeks)
2. Launch agents.1labs.ai MVP (4 weeks)
3. Iterate based on user feedback

---

*Document maintained by Ariv for 1Labs.ai*
