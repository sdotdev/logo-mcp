# logo-mcp: Development Guide for AI Assistants

A Next.js-based Model Context Protocol (MCP) server for the Simple Icons logo library, deployable on Vercel and usable with Claude Desktop.

## Quick Context

- **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Zod
- **Core Purpose:** MCP server exposing tools to search, retrieve, and customize brand logos from Simple Icons
- **Deployment:** Vercel (HTTP/SSE) + Claude Desktop (stdio)
- **Status:** Early development—Phase 1 (HTTP + core tools) in progress

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ logo-mcp Repository                                         │
├─────────────────────────────────────────────────────────────┤
│ Next.js 16 (App Router)                                     │
│ ├─ app/api/mcp/route.ts     ← HTTP/SSE MCP endpoint        │
│ ├─ app/page.tsx              ← Landing page / docs          │
│ ├─ app/layout.tsx            ← Root layout                  │
│ └─ ...                                                      │
│                                                             │
│ src/ (planned structure)                                    │
│ ├─ mcp/                                                     │
│ │  ├─ server.ts              ← createLogoMcpServer()       │
│ │  └─ tools/                                               │
│ │     ├─ search-logo.ts                                    │
│ │     ├─ get-logo-svg.ts                                   │
│ │     ├─ get-logo-url.ts                                   │
│ │     ├─ list-logos.ts                                     │
│ │     ├─ get-logo-metadata.ts                              │
│ │     ├─ download-logo.ts                                  │
│ │     └─ index.ts            ← registerAllTools(server)    │
│ ├─ lib/                                                     │
│ │  └─ simple-icons.ts        ← search, caching, helpers    │
│ └─ stdio-server.ts           ← npx/Claude Desktop entry    │
│                                                             │
│ package.json                                                │
│ next.config.ts               ← CORS headers for /api/mcp   │
│ tsconfig.json               ← strict mode, path aliases    │
│ README.md                   ← User-facing documentation    │
│ AGENTS.md                   ← Next.js breaking changes     │
│ mcp-server-patterns.md      ← MCP protocol + patterns      │
│ simple-icons-cdn.md         ← Simple Icons SDK research    │
│ CLAUDE.md                   ← THIS FILE                    │
└─────────────────────────────────────────────────────────────┘
```

## Key Conventions & Rules

### 1. Next.js 16 is Different

**Read AGENTS.md before writing code.** This version (16.x) has breaking changes:
- File structure conventions may differ from your training data
- Read `node_modules/next/dist/docs/` for authoritative answers
- Check deprecation notices on every API you use

### 2. MCP Server Basics

MCP is a standardized protocol for AI applications (Claude Desktop, Cursor, Claude.ai) to call external tools and fetch context.

**Architecture:**
- **Host:** Claude Desktop / Claude.ai / Cursor / VS Code
- **Client:** Built into host, maintains server connection
- **Server:** Your process (this one) that exposes tools/resources/prompts

**Three Primitives:**
- **Tools** (LLM-controlled): `search_logo("stripe")` → agent decides when to call
- **Resources** (app-controlled): `logo://stripe` → app injects context
- **Prompts** (user-controlled): `/logo-brand-guide stripe` → user explicitly invokes

This project emphasizes **Tools** (search, retrieval, metadata).

### 3. Transport: HTTP/SSE (Vercel) vs stdio (Claude Desktop)

| Transport | Where | Use Case | Logging |
|-----------|-------|----------|---------|
| **HTTP/SSE** | `/api/mcp/route.ts` → Vercel | Remote, many clients, Production | `console.error()` + response logging |
| **stdio** | `src/stdio-server.ts` → npx | Local, Claude Desktop | ONLY `console.error()` — `console.log()` corrupts protocol |

**CRITICAL:** In stdio mode, `console.log()` writes to stdout and **breaks the JSON-RPC stream**. Always use `console.error()`.

### 4. Zod for Validation

All tool inputs must use Zod schemas—not raw JSON Schema:

```typescript
const searchInputSchema = z.object({
  query: z.string().min(1).describe("Brand name to search"),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

server.registerTool("search_logo", { description: "...", inputSchema: searchInputSchema }, async ({ query, limit }) => {
  // ...
});
```

The `describe()` method on each field is load-bearing—the LLM reads these to decide when to call your tools.

### 5. Error Handling: `isError: true` for Recoverable Errors

Don't throw—return `isError: true` so the LLM can retry with corrected params:

```typescript
return {
  content: [{ type: "text" as const, text: `Logo not found: "${slug}". Try search_logo to find valid slugs.` }],
  isError: true,
};
```

For truly unrecoverable errors (server crash), throw—but keep those rare.

### 6. Simple Icons SDK & Serving

**Data loading:**
```typescript
import { getIconsData } from "simple-icons/sdk";
const icons = await getIconsData(); // Returns IconData[] with all metadata
```

**Each icon has:**
```typescript
{
  title: "GitHub",           // Official brand name
  slug: "github",            // URL-safe identifier
  hex: "181717",             // Brand color (NO #)
  source: "...",             // Official source URL
  svg: "<svg>...</svg>",     // Raw SVG string
  guidelines?: "...",        // Brand guidelines URL (optional)
  license?: { type, url },   // License info (optional)
  aliases?: {                // Search aliases
    aka?: ["GH", "..."],
    old?: ["legacy-name"],
    loc?: { es: "GitHub" },
  }
}
```

**Serving priorities:**
1. **Fastest:** Return `icon.svg` from npm package (no network)
2. **Flexible:** Use `cdn.simpleicons.org/{slug}/{color}` for coloring
3. **Stable:** jsDelivr `@v15` for production stability

**Search index pattern** (see `simple-icons-cdn.md` §10):
```typescript
const searchable = [
  icon.title,
  icon.slug,
  ...(icon.aliases?.aka ?? []),
  ...(icon.aliases?.old ?? []),
].join(" ").toLowerCase();
```

### 7. Tool Response Format

All tools return `ToolResult`:
```typescript
{
  content: [{
    type: "text" | "image" | "resource_link" | "resource",
    text?: string,           // for text
    data?: string,           // for image (base64)
    uri?: string,            // for resource_link
    resource?: { uri, mimeType, text },  // for embedded resource
  }],
  isError?: boolean,         // true = recoverable, retry with LLM
  structuredContent?: any,   // matches outputSchema (optional)
}
```

### 8. Deployment Targets

**Vercel (HTTP/SSE):**
- Route: `app/api/mcp/route.ts`
- Export: `export const { GET, POST, DELETE } = handler`
- Runtime: `export const runtime = "nodejs"` (SSE requires Node.js, not Edge)
- Duration: `export const maxDuration = 60` (seconds)
- Session persistence: Redis/Vercel KV (ephemeral memory won't work)

**Claude Desktop (stdio):**
- Entrypoint: `src/stdio-server.ts`
- Package.json: `"bin": { "logo-mcp": "dist/stdio-server.js" }`
- Users add to `claude_desktop_config.json`: `{ "command": "npx", "args": ["-y", "logo-mcp"] }`

**Required CORS headers** (next.config.ts):
```typescript
async headers() {
  return [
    {
      source: "/api/mcp",
      headers: [
        { key: "Cache-Control", value: "no-store" },
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET, POST, DELETE, OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type, MCP-Session-Id, MCP-Protocol-Version" },
      ],
    },
  ];
}
```

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Run dev server (Next.js + HMR)
npm run dev

# Open http://localhost:3000
# API endpoint: http://localhost:3000/api/mcp
```

### Testing the MCP Server

**Option A: MCP Inspector (Recommended)**
```bash
# Download: https://github.com/modelcontextprotocol/inspector
# Test HTTP endpoint
npx @modelcontextprotocol/inspector http://localhost:3000/api/mcp

# Opens UI at http://localhost:5173 with Tools, Resources, Prompts tabs
```

**Option B: curl**
```bash
# Initialize a session
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "MCP-Protocol-Version: 2025-11-25" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'

# List tools (use MCP-Session-Id from response)
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "MCP-Session-Id: <session-id>" \
  -H "MCP-Protocol-Version: 2025-11-25" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

**Option C: Claude Desktop**
1. Build: `npm run build`
2. Configure: Add to `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "logo-mcp": {
         "command": "node",
         "args": ["/absolute/path/to/logo-mcp/dist/stdio-server.js"]
       }
     }
   }
   ```
3. Restart Claude Desktop, look for `logo-mcp` in toolbox

### Building & Deployment

```bash
# Type check + build
npm run build

# Linting
npm run lint

# Deploy to Vercel (automatic from git push)
git push origin <branch>
```

## Key Dependencies

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `@modelcontextprotocol/sdk` | ^1.29.0 | Core MCP SDK | Tool/resource/prompt registration |
| `@vercel/mcp-adapter` | ^0.3.2 | Next.js wrapper | HTTP/SSE transport, session mgmt |
| `next` | 16.2.3 | Web framework | App Router, API routes |
| `react` | 19.2.4 | UI library | Components, hooks |
| `react-dom` | 19.2.4 | DOM rendering | ReactDOM.render |
| `simple-icons` | ^16.16.0 | Logo data + SVG | 3300+ brand icons, `sdk` export for search |
| `zod` | ^4.3.6 | Validation | Schema + TypeScript inference |
| `tailwindcss` | ^4 | Styling | CSS utility framework |
| `@tailwindcss/postcss` | ^4 | PostCSS integration | Tailwind v4 compilation |
| `typescript` | ^5 | Language | Strict type checking |
| `eslint` | ^9 | Linting | ESLint 9 (flat config) |

## File-by-File Guide

### `app/api/mcp/route.ts`
- HTTP/SSE MCP endpoint (Vercel)
- Uses `@vercel/mcp-adapter` to handle JSON-RPC over HTTP
- Calls `registerAllTools(server)` to expose all tools
- **Must export:** `GET, POST, DELETE` + `runtime`, `maxDuration`

### `app/page.tsx`
- Landing page—update with MCP server description and usage instructions
- Currently shows generic Next.js template

### `app/layout.tsx`
- Root HTML structure
- Font setup (Geist Sans/Mono from Google Fonts)

### `next.config.ts`
- CORS headers for `/api/mcp` endpoint
- Should not be empty—add headers() for HTTP MCP

### `tsconfig.json`
- Strict mode enabled (`strict: true`)
- Path alias: `@/*` → root directory
- No custom module resolution needed for MCP

### `package.json`
- Scripts: `dev`, `build`, `start`, `lint`
- **No `bin` entry yet**—add when publishing to npm:
  ```json
  "bin": {
    "logo-mcp": "dist/stdio-server.js"
  }
  ```

### `AGENTS.md`
- Red flag: Next.js 16 has breaking changes
- Always read docs in `node_modules/next/dist/docs/`

### `mcp-server-patterns.md`
- Comprehensive MCP protocol reference
- Sections: Protocol basics, three primitives, transport, SDK patterns, deployment
- Read when adding new tools or changing architecture

### `simple-icons-cdn.md`
- Simple Icons package + SDK documentation
- Icon object structure, search patterns, CDN options
- Reference when building search/retrieval tools

## Tool Registration Pattern

All tools follow this shape:

```typescript
server.registerTool(
  "tool_name",                              // unique slug
  {
    title: "Human-Readable Title",
    description: "What does this do? When would LLM call it?",
    inputSchema: z.object({
      param: z.string().describe("User-visible description"),
    }),
    outputSchema: z.object({ /* optional */ }),  // for structured output
  },
  async ({ param }) => {                    // handler
    try {
      const result = await doWork(param);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text" as const, text: String(err) }],
        isError: true,  // LLM can retry
      };
    }
  }
);
```

## Phase Implementation Plan

### Phase 1: Core HTTP + 3 Tools (Current)
- [ ] `search_logo(query, limit)` — find logos by brand name
- [ ] `get_logo_svg(slug, color)` — retrieve SVG markup
- [ ] `get_logo_metadata(slug)` — brand color, guidelines, license

### Phase 2: Full Suite + Resources
- [ ] `get_logo_url(slug, color, darkColor, viewboxAuto)` — CDN URL builder
- [ ] `list_logos(page, limit)` — paginated logo listing
- [ ] `download_logo(slug, format, color)` — download-ready SVG
- [ ] Resource template: `logo://{slug}` → SVG content

### Phase 3: stdio + npm Publish
- [ ] `src/stdio-server.ts` — Claude Desktop entry
- [ ] Build & test with MCP Inspector
- [ ] Publish to npm with `bin` entry
- [ ] List in MCP Registry

## Common Pitfalls

1. **`console.log()` in stdio mode** → Silent protocol corruption. Use `console.error()` only.
2. **Throwing in tools** → Breaks LLM retry logic. Return `isError: true` instead.
3. **Raw JSON Schema instead of Zod** → SDK expects Zod; plain objects fail.
4. **Missing `describe()` on Zod fields** → LLM can't read your intent.
5. **Ephemeral memory for session state (Vercel)** → Use Redis/Vercel KV for SSE persistence.
6. **Edge Runtime for MCP route** → SSE requires Node.js runtime.
7. **Missing CORS headers** → HTTP clients rejected by browser/desktop.
8. **Icon hex with `#` prefix** → Simple Icons provides `hex` without `#`; add it manually.

## Testing Checklist

- [ ] Lint: `npm run lint`
- [ ] Build: `npm run build`
- [ ] MCP Inspector: Tools/Resources/Prompts tabs load
- [ ] Each tool: Test with MCP Inspector UI
- [ ] Claude Desktop: Server connects, tools callable
- [ ] Error handling: Search for nonexistent logo, verify `isError: true`
- [ ] Browser: `http://localhost:3000` loads

## Legal & Compliance

- Simple Icons SVGs: CC0 1.0 (public domain)
- Brand logos: Trademarks of respective owners
- Disclaimer required in README
- `get_logo_metadata` surfaces brand guidelines URLs

See `simple-icons-cdn.md` §8 for full legal text template.

## References

- MCP Spec (2025-11-25): https://modelcontextprotocol.io/specification/2025-11-25
- Build MCP Server: https://modelcontextprotocol.io/docs/develop/build-server
- Tools Spec: https://modelcontextprotocol.io/specification/2025-11-25/server/tools
- MCP Inspector: https://github.com/modelcontextprotocol/inspector
- @vercel/mcp-adapter: https://www.npmjs.com/package/@vercel/mcp-adapter
- Simple Icons: https://simpleicons.org
- Reference Servers: https://github.com/modelcontextprotocol/servers
- Next.js Docs: https://nextjs.org/docs (especially `/dist/docs` in node_modules)

## Development Branch

Active development occurs on feature branches. Current branch:
- **Branch:** `claude/add-claude-documentation-fwnHc`
- **Status:** Documentation and architecture setup
- **Next:** Core tool implementation (Phase 1)

Always pull the latest before starting new work:
```bash
git fetch origin
git checkout claude/add-claude-documentation-fwnHc
```

---

**Last Updated:** 2026-04-14  
**Target:** Next.js 16 + MCP 2025-11-25 spec
