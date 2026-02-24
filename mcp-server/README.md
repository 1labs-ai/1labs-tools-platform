# 1Labs Tools MCP Server

Connect 1Labs AI tools to Claude Desktop, n8n, or any MCP-compatible client.

## Features

**Tools:**
- `roadmap_generator` - Generate product roadmaps with quarterly milestones
- `prd_generator` - Create comprehensive Product Requirements Documents
- `pitch_deck_generator` - Generate investor-ready pitch decks
- `persona_generator` - Create detailed user personas

**Resources:**
- `1labs://credits` - Check your credit balance
- `1labs://generations` - View past generations

## Installation

### For Claude Desktop

1. **Get your API key** from [1labs.ai/account/api-keys](https://1labs.ai/account/api-keys)

2. **Add to Claude Desktop config:**

   **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   
   **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "1labs-tools": {
         "command": "npx",
         "args": ["-y", "@1labs/mcp-tools"],
         "env": {
           "ONELABS_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

### For n8n

Use the MCP node with:
- **Command:** `npx -y @1labs/mcp-tools`
- **Environment:** `ONELABS_API_KEY=your-api-key`

### Manual Installation

```bash
npm install -g @1labs/mcp-tools
export ONELABS_API_KEY="your-api-key"
1labs-tools-mcp
```

## Usage Examples

### Generate a Product Roadmap

```
Use the roadmap_generator tool to create a roadmap for: 
"A mobile app that helps remote teams stay connected through 
async video updates and team mood tracking."
```

### Create a PRD

```
Use the prd_generator tool to create a PRD for:
"An AI-powered code review tool that integrates with GitHub 
and provides actionable suggestions for improvement."
```

### Generate a Pitch Deck

```
Use the pitch_deck_generator tool for:
Company: "TechFlow"
Description: "We automate DevOps workflows using AI, 
reducing deployment time by 80%"
Stage: "seed"
Industry: "Developer Tools"
```

### Create User Personas

```
Use the persona_generator to create 3 personas for:
"A meditation app targeting busy professionals who want 
to reduce stress and improve focus."
```

## API Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ONELABS_API_KEY` | Yes | Your 1Labs API key |
| `ONELABS_API_URL` | No | API base URL (default: https://1labs.ai) |

### Credit Costs

| Tool | Credits |
|------|---------|
| `roadmap_generator` | 5 |
| `prd_generator` | 10 |
| `pitch_deck_generator` | 10 |
| `persona_generator` | 5 |

## Development

```bash
# Clone and install
git clone https://github.com/1labs-ai/1labs-tools-platform
cd mcp-server
npm install

# Run in development mode
export ONELABS_API_KEY="your-key"
npm run dev

# Build
npm run build
```

## Troubleshooting

### "API key not set" error
Make sure `ONELABS_API_KEY` is set in your environment or MCP config.

### "Insufficient credits" error
Purchase credits at [1labs.ai/pricing](https://1labs.ai/pricing) or check your balance using the `1labs://credits` resource.

### Server not starting
1. Ensure Node.js 18+ is installed
2. Check that your API key is valid
3. Try running manually: `npx @1labs/mcp-tools`

## Support

- **Docs:** [1labs.ai/docs](https://1labs.ai/docs)
- **Discord:** [discord.gg/1labs](https://discord.gg/1labs)
- **Email:** hello@1labs.ai

## License

MIT
