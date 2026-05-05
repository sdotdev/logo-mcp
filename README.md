# logo-mcp

An MCP server that gives AI agents instant access to 3,300+ brand logos as clean SVGs.

Works with Claude Desktop, Cursor, Windsurf, and any MCP-compatible client.

## What it does

logo-mcp exposes Simple Icons through the Model Context Protocol. Ask your AI agent "find me the Stripe logo" and it returns the SVG — no manual downloading, no copy-pasting, no API keys.

**MCP tools:**
- `search_logo(query, limit)` — find logos by name, slug, alias (fb, gh), ticker (AAPL), or domain (stripe.com)
- `get_logo_svg(slug, color)` — retrieve SVG markup, optionally in a custom hex color
- `get_logo_metadata(slug)` — brand color, guidelines URL, license info

**Web interface** at `/icons` — browse, search, copy SVG, download PNG, batch lookup.

## Quick start

### Claude Desktop (HTTP)

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "logo-mcp": {
      "url": "https://your-deployment.com/api/mcp"
    }
  }
}
```

Or via CLI:

```bash
claude mcp add --transport http logo-mcp https://your-deployment.com/api/mcp
```

### Local development

```bash
npm install
npm run dev
# Server at http://localhost:3000
# MCP endpoint at http://localhost:3000/api/mcp
```

For local Claude Desktop use:

```bash
claude mcp add --transport http logo-mcp http://localhost:3000/api/mcp
```

### Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector http://localhost:3000/api/mcp
```

Opens a UI at `http://localhost:5173` to browse tools, call them manually, and inspect responses.

## Deploy

Push to GitHub and connect to Vercel. The `/api/mcp` route is pre-configured with the required CORS headers and Node.js runtime.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- `@modelcontextprotocol/sdk` — MCP protocol
- `@vercel/mcp-adapter` — HTTP/SSE transport
- `simple-icons` — logo data and SVGs
- `zod` — input validation

## Legal

SVG data from [Simple Icons](https://simpleicons.org), released under CC0 1.0 (public domain). Brand logos and trademarks are the property of their respective owners. Users are responsible for compliance with each brand's trademark guidelines.
