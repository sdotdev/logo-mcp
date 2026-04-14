# MCP Server Patterns: Comprehensive Research
# Logo Library MCP Server — Implementation Reference

> Research based on official MCP specification (2025-11-25), modelcontextprotocol.io docs,
> @modelcontextprotocol/sdk TypeScript SDK (Context7 indexed), and @vercel/mcp-adapter docs.
> Target: A Simple Icons logo library MCP server deployed on Vercel (Next.js 16).

---

## Table of Contents

1. [MCP Protocol Basics](#1-mcp-protocol-basics)
2. [The Three Primitives](#2-the-three-primitives)
3. [Transport Options](#3-transport-options)
4. [TypeScript SDK — @modelcontextprotocol/sdk](#4-typescript-sdk)
5. [Next.js as an MCP Server](#5-nextjs-as-an-mcp-server)
6. [Logo Library Tool Definitions](#6-logo-library-tool-definitions)
7. [Resources vs Tools — Decision Guide](#7-resources-vs-tools)
8. [Deployment Patterns](#8-deployment-patterns)
9. [Claude Desktop & AI Client Configuration](#9-claude-desktop-configuration)
10. [Testing MCP Servers](#10-testing-mcp-servers)
11. [Real-World Examples](#11-real-world-examples)
12. [Recommended Architecture](#12-recommended-architecture)

---

## 1. MCP Protocol Basics

### What is MCP?

Model Context Protocol (MCP) is an open-source standard for connecting AI applications to
external systems. Think of it as a USB-C port for AI: a standardized way to connect AI
applications (hosts like Claude Desktop, Cursor, VS Code Copilot) to data sources, tools,
and workflows.

**Key insight for logo library:** MCP lets an AI agent call `search_logo("stripe")` and
get back SVG data — without the agent needing to know anything about Simple Icons' API.

### Architecture

```
MCP Host (Claude Desktop / Claude.ai / Cursor)
  └── MCP Client 1 ──── MCP Server A (your logo-mcp server)
  └── MCP Client 2 ──── MCP Server B (filesystem server)
  └── MCP Client 3 ──── MCP Server C (remote Sentry server)
```

- **MCP Host**: The AI application (Claude Desktop, Cursor, VS Code)
- **MCP Client**: A component inside the host that maintains one server connection
- **MCP Server**: Your program that exposes tools/resources/prompts

Local servers use **stdio** transport (one client per server process).
Remote servers use **Streamable HTTP** transport (many clients per server).

### Protocol Wire Format

MCP uses JSON-RPC 2.0 over UTF-8. Example tool call exchange:

```json
// Client → Server: tool invocation
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "search_logo",
    "arguments": { "query": "stripe" }
  }
}

// Server → Client: tool result
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{ "type": "text", "text": "{\"slug\":\"stripe\",\"title\":\"Stripe\",\"hex\":\"635BFF\"}" }]
  }
}
```

### Lifecycle

1. Client sends `initialize` with `protocolVersion` and `capabilities`
2. Server responds with its capabilities (tools, resources, prompts)
3. Client sends `notifications/initialized`
4. Normal operation: `tools/list`, `tools/call`, `resources/list`, etc.
5. Session terminates (HTTP DELETE or process exit)

---

## 2. The Three Primitives

### Comparison Table

| Primitive    | Controlled By | Use When                                          | Example                          |
|--------------|---------------|---------------------------------------------------|----------------------------------|
| **Tools**    | Model (LLM)   | LLM decides when to invoke; performs actions      | `search_logo("stripe")`          |
| **Resources**| Application   | App fetches read-only context data; URI-based     | `logo://stripe` → SVG content    |
| **Prompts**  | User          | User explicitly triggers a workflow template      | `/logo-usage-guide stripe`       |

### Tools

- **Model-controlled**: The LLM decides autonomously when to call them
- Defined with JSON Schema / Zod for input validation
- Return `content[]` array (text, image, audio, resource_link, embedded resource)
- Support `isError: true` for recoverable errors the LLM can retry
- For a logo library: ALL search/retrieval operations should be tools

### Resources

- **Application-controlled**: The host app decides what context to inject
- URI-addressable (e.g., `logo://stripe`, `file:///path/to/file`)
- Read-only; support subscription for change notifications
- Two types: direct resources (fixed URIs) and resource templates (parameterized URIs)
- For a logo library: Individual logo SVGs can be resources when the app wants to pre-load context

### Prompts

- **User-controlled**: User explicitly selects and invokes them (e.g., slash commands)
- Parameterized templates that produce structured message arrays
- For a logo library: `logo-brand-guide` prompt template is a good use case

---

## 3. Transport Options

### stdio Transport

Used for **local MCP servers** (Claude Desktop, local development tools).

```
Claude Desktop
  └── spawns subprocess: node /path/to/server.js
        ├── stdin  ← JSON-RPC messages from client
        ├── stdout → JSON-RPC responses to client
        └── stderr → logs (safe to write here)
```

**CRITICAL RULE for stdio:** NEVER use `console.log()` — it writes to stdout and corrupts
the JSON-RPC stream. Always use `console.error()` for logging.

```typescript
// WRONG for stdio — SILENTLY BREAKS PROTOCOL:
console.log("Server started");

// CORRECT for stdio:
console.error("Server started");
```

### Streamable HTTP Transport (formerly HTTP+SSE)

Used for **remote MCP servers** (Vercel deployment, hosted APIs). Current spec: 2025-11-25.

- Server operates as an independent process handling multiple clients
- **Single HTTP endpoint** supporting both POST and GET (unified in 2025-11-25 spec)
- Client sends JSON-RPC via HTTP POST
- Server can respond with `application/json` (single response) or `text/event-stream` (SSE)
- Session management via `MCP-Session-Id` header

```
Client → POST /api/mcp  (JSON-RPC request, includes initialize)
       ← SSE stream OR JSON response

Client → GET  /api/mcp  (open persistent notification stream)
       ← SSE stream with server-to-client messages

Client → DELETE /api/mcp  (terminate session)
       ← 204 No Content
```

**Required headers for HTTP requests:**
```
MCP-Protocol-Version: 2025-11-25
Content-Type: application/json
Accept: application/json, text/event-stream
```

**Security requirements:**
- MUST validate `Origin` header (prevent DNS rebinding attacks)
- Return HTTP 403 if Origin is not in allowlist
- Implement authentication for production deployments

### Backwards Compatibility

The 2024-11-05 spec used separate GET (SSE) and POST endpoints.
The 2025-11-25 spec unifies them into a single `/api/mcp` endpoint.
`@vercel/mcp-adapter` handles both automatically.

---

## 4. TypeScript SDK

### Installation

```bash
npm install @modelcontextprotocol/sdk zod
```

### McpServer Class — High-Level API

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "logo-mcp",
  version: "1.0.0",
});

// Register a tool (v2 API)
server.registerTool(
  "search_logo",
  {
    title: "Search Logos",
    description: "Search for brand logos by name. Returns matching logo slugs, titles, and hex colors.",
    inputSchema: z.object({
      query: z.string().describe("Brand name to search for (e.g. 'stripe', 'github', 'vercel')"),
      limit: z.number().min(1).max(50).optional().default(10)
        .describe("Maximum number of results to return"),
    }),
  },
  async ({ query, limit }) => {
    const results = await searchLogos(query, limit);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
    };
  }
);

// Register a resource with URI template
server.registerResource(
  "logo-svg",
  "logo://{slug}",
  {
    name: "Brand Logo SVG",
    description: "Raw SVG content for a brand logo",
    mimeType: "image/svg+xml",
  },
  async (uri, { slug }) => ({
    contents: [{
      uri: uri.href,
      mimeType: "image/svg+xml",
      text: await fetchLogoSvg(slug as string),
    }],
  })
);

// Register a prompt
server.registerPrompt(
  "logo-usage-guide",
  {
    description: "Generate brand usage guidelines for a logo",
    argsSchema: z.object({
      brand: z.string().describe("Brand name"),
    }),
  },
  ({ brand }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please provide brand usage guidelines for ${brand}, including when to use their logo, color recommendations, and accessibility notes.`,
      },
    }],
  })
);
```

### Tool Return Types

```typescript
// Text content (most common)
return { content: [{ type: "text" as const, text: "result string" }] };

// Image content (base64)
return { content: [{ type: "image" as const, data: base64String, mimeType: "image/png" }] };

// Recoverable error — LLM can retry with corrected params
return {
  content: [{ type: "text" as const, text: "Error: slug not found. Try search_logo to find valid slugs." }],
  isError: true,
};

// Resource link (reference, client fetches separately)
return {
  content: [{
    type: "resource_link" as const,
    uri: "logo://stripe",
    name: "Stripe Logo",
    mimeType: "image/svg+xml",
  }],
};

// Embedded resource (inline the full resource content in the response)
return {
  content: [{
    type: "resource" as const,
    resource: {
      uri: "logo://stripe",
      mimeType: "image/svg+xml",
      text: "<svg>...</svg>",
    },
  }],
};
```

### Structured Output (outputSchema)

```typescript
server.registerTool(
  "get_logo_metadata",
  {
    description: "Get brand metadata including official color and guidelines",
    inputSchema: z.object({ slug: z.string() }),
    outputSchema: z.object({
      slug: z.string(),
      title: z.string(),
      hex: z.string(),
      source: z.string().url(),
      guidelines: z.string().url().optional(),
    }),
  },
  async ({ slug }) => {
    const meta = await getMetadata(slug);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(meta) }],
      structuredContent: meta,  // matches outputSchema
    };
  }
);
```

---

## 5. Next.js as an MCP Server

### The @vercel/mcp-adapter Package

Vercel provides `@vercel/mcp-adapter` which wraps `@modelcontextprotocol/sdk` for
seamless Next.js App Router integration:

```bash
npm install @vercel/mcp-adapter @modelcontextprotocol/sdk zod
```

### Basic Route Handler (Recommended)

```typescript
// app/api/mcp/route.ts
import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "search_logo",
      "Search for brand logos by name",
      { query: z.string().describe("Brand name to search") },
      async ({ query }) => ({
        content: [{ type: "text" as const, text: await searchLogos(query) }],
      })
    );
  },
  {
    capabilities: {
      tools: { listChanged: false },
      resources: {},
    },
  },
  {
    redisUrl: process.env.REDIS_URL,     // for SSE session persistence on serverless
    basePath: "/api/mcp",               // must match route path
    verboseLogs: process.env.NODE_ENV !== "production",
    maxDuration: 60,                     // Vercel function timeout in seconds
  }
);

export const { GET, POST, DELETE } = handler;
```

### Vercel-Specific Configuration

```typescript
// app/api/mcp/route.ts — add these exports for Vercel
export const maxDuration = 60;        // seconds (use 800 on Pro with streaming)
export const runtime = "nodejs";      // NOT Edge — SSE requires Node.js
```

### CORS Headers for MCP Endpoint

```typescript
// next.config.ts
const nextConfig = {
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
  },
};
```

---

## 6. Logo Library Tool Definitions

All 6 tools for a complete logo library MCP server:

### search_logo

```typescript
server.registerTool(
  "search_logo",
  {
    description:
      "Search for brand/company logos by name. Returns a list of matching logos " +
      "with their slugs, official titles, and brand hex colors. Use this to find " +
      "the correct slug before calling get_logo_svg or get_logo_url.",
    inputSchema: z.object({
      query: z.string().min(1)
        .describe("Brand name or keyword to search for (e.g. 'stripe', 'github', 'amazon web services')"),
      limit: z.number().int().min(1).max(50).optional().default(10)
        .describe("Maximum number of results to return (default: 10, max: 50)"),
    }),
  },
  async ({ query, limit }) => {
    const results = await searchIcons(query, limit);
    if (results.length === 0) {
      return { content: [{ type: "text" as const, text: `No logos found matching "${query}"` }] };
    }
    return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
  }
);
```

### get_logo_svg

```typescript
server.registerTool(
  "get_logo_svg",
  {
    description:
      "Retrieve the raw SVG markup for a brand logo by its Simple Icons slug. " +
      "Returns SVG string ready to embed in HTML/CSS. Use search_logo first to find the slug.",
    inputSchema: z.object({
      slug: z.string().regex(/^[a-z0-9]+$/, "Slug must be lowercase alphanumeric")
        .describe("Simple Icons slug (e.g. 'github', 'stripe', 'vercel')"),
      color: z.string().regex(/^#?[0-9a-fA-F]{6}$/).optional()
        .describe("Override fill color as hex (e.g. '#FF0000' or 'FF0000'). Defaults to brand color."),
    }),
  },
  async ({ slug, color }) => {
    const icon = await findIconBySlug(slug);
    if (!icon) {
      return {
        content: [{ type: "text" as const, text: `Logo not found for slug: "${slug}". Use search_logo to find valid slugs.` }],
        isError: true,
      };
    }
    let svg = icon.svg;
    if (color) {
      const hex = color.startsWith("#") ? color : `#${color}`;
      svg = svg.replace("<svg ", `<svg fill="${hex}" `);
    }
    return { content: [{ type: "text" as const, text: svg }] };
  }
);
```

### get_logo_url

```typescript
server.registerTool(
  "get_logo_url",
  {
    description: "Get the CDN URL for a brand logo. Returns a URL usable in <img> tags or as background-image. Supports custom colors.",
    inputSchema: z.object({
      slug: z.string().describe("Simple Icons slug (e.g. 'github', 'stripe')"),
      color: z.string().optional()
        .describe("Color override as hex without # (e.g. 'FF0000' for red, or CSS keyword 'orange')"),
      darkColor: z.string().optional()
        .describe("Dark-mode color override as hex without # (for responsive theming)"),
      viewboxAuto: z.boolean().optional().default(false)
        .describe("If true, appends ?viewbox=auto for consistent sizing across icons"),
    }),
  },
  async ({ slug, color, darkColor, viewboxAuto }) => {
    let url = `https://cdn.simpleicons.org/${slug}`;
    if (color) {
      url += `/${color}`;
      if (darkColor) url += `/${darkColor}`;
    }
    if (viewboxAuto) url += "?viewbox=auto";
    return { content: [{ type: "text" as const, text: url }] };
  }
);
```

### list_logos

```typescript
server.registerTool(
  "list_logos",
  {
    description: "List all available brand logos with pagination. Returns slugs, titles, and hex colors.",
    inputSchema: z.object({
      page: z.number().int().min(1).optional().default(1)
        .describe("Page number (1-indexed, default: 1)"),
      limit: z.number().int().min(1).max(100).optional().default(20)
        .describe("Items per page (default: 20, max: 100)"),
    }),
  },
  async ({ page, limit }) => {
    const icons = await getIcons();
    const total = icons.length;
    const offset = (page - 1) * limit;
    const pageItems = icons.slice(offset, offset + limit).map(({ title, slug, hex }) => ({ title, slug, hex }));
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ total, page, limit, totalPages: Math.ceil(total / limit), icons: pageItems }, null, 2),
      }],
    };
  }
);
```

### get_logo_metadata

```typescript
server.registerTool(
  "get_logo_metadata",
  {
    description:
      "Get detailed metadata for a brand logo: official brand color, source URL, " +
      "license info, and usage guidelines URL. Always check guidelines before using a logo commercially.",
    inputSchema: z.object({
      slug: z.string().describe("Simple Icons slug (e.g. 'github', 'stripe')"),
    }),
  },
  async ({ slug }) => {
    const icons = await getIcons();
    const icon = icons.find((i) => i.slug === slug);
    if (!icon) {
      return {
        content: [{ type: "text" as const, text: `No metadata found for slug: "${slug}"` }],
        isError: true,
      };
    }
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          slug: icon.slug,
          title: icon.title,
          hex: `#${icon.hex}`,
          source: icon.source,
          license: icon.license ?? null,
          guidelines: icon.guidelines ?? null,
          svgUrl: `https://cdn.simpleicons.org/${slug}`,
          coloredSvgUrl: `https://cdn.simpleicons.org/${slug}/${icon.hex}`,
        }, null, 2),
      }],
    };
  }
);
```

### download_logo

```typescript
server.registerTool(
  "download_logo",
  {
    description:
      "Get a logo ready for download. Returns SVG text or a download URL. " +
      "The agent can save this to a file or provide it to the user.",
    inputSchema: z.object({
      slug: z.string().describe("Simple Icons slug"),
      format: z.enum(["svg"]).default("svg")
        .describe("Output format ('svg' returns raw SVG markup)"),
      color: z.string().optional()
        .describe("Color override as hex without # (e.g. '635BFF')"),
    }),
  },
  async ({ slug, color }) => {
    const icon = await findIconBySlug(slug);
    if (!icon) {
      return {
        content: [{ type: "text" as const, text: `Logo not found: "${slug}". Use search_logo to find valid slugs.` }],
        isError: true,
      };
    }
    let svg = icon.svg;
    if (color) {
      svg = svg.replace("<svg ", `<svg fill="#${color}" `);
    }
    return {
      content: [{
        type: "text" as const,
        text: svg,
        annotations: { audience: ["user"] as ("user" | "assistant")[] },
      }],
    };
  }
);
```

---

## 7. Resources vs Tools

### Decision Framework

**Use a Tool when:**
- The LLM decides when to fetch data based on conversation context
- Operation is search/query-based (requires dynamic parameters)
- Error handling that allows LLM to retry is valuable
- Real-time or dynamic data is involved

**Use a Resource when:**
- The host application (not the LLM) decides what context to inject
- Data is addressable by a stable URI
- Content is relatively static
- Users should be able to browse/select in a file-picker-style UI

**Recommendation for Logo Library:**
- `search_logo`, `get_logo_svg`, `get_logo_url`, `list_logos`, `get_logo_metadata`, `download_logo` → **Tools**
- Individual logo SVGs at `logo://{slug}` → **Resources** (optional, for context injection)

### Resource URI Template Pattern

```typescript
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

server.registerResource(
  "logo-svg",
  new ResourceTemplate("logo://{slug}", { list: undefined }),
  {
    name: "Brand Logo SVG",
    description: "Raw SVG for any Simple Icons brand by slug",
    mimeType: "image/svg+xml",
  },
  async (uri, { slug }) => {
    const icon = await findIconBySlug(slug as string);
    if (!icon) throw new Error(`Logo not found: ${slug}`);
    return {
      contents: [{
        uri: uri.href,
        mimeType: "image/svg+xml",
        text: icon.svg,
      }],
    };
  }
);
```

---

## 8. Deployment Patterns

### Pattern A: Hosted HTTP MCP on Vercel

```
Repository → Vercel deployment → https://logo-mcp.vercel.app/api/mcp
```

Users connect via:
- **Claude.ai:** Settings → Connectors → Add Custom Connector → enter HTTPS URL
- **Claude Desktop (v0.9+):** `{ "url": "https://logo-mcp.vercel.app/api/mcp" }` in config

**Vercel-specific notes:**
- Use Node.js runtime (NOT Edge) for SSE support
- Set `maxDuration = 60` (Pro: up to 800s for streaming)
- Redis/Vercel KV required for session state across serverless invocations
- CORS headers required on `/api/mcp`

### Pattern B: Local stdio MCP (npx-runnable)

Users add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "logo-mcp": {
      "command": "npx",
      "args": ["-y", "logo-mcp"]
    }
  }
}
```

Requires publishing to npm with a `bin` entry in package.json.

### Pattern C: Both from Same Codebase (Recommended)

Shared tool logic, two entrypoints:

```
src/mcp/tools/index.ts        ← registerAllTools(server) — shared
app/api/mcp/route.ts          ← HTTP entrypoint (Vercel)
src/stdio-server.ts           ← stdio entrypoint (Claude Desktop / npx)
```

```typescript
// src/mcp/tools/index.ts
export function registerAllTools(server: McpServer) {
  // register all 6 tools
}

// app/api/mcp/route.ts
import { createMcpHandler } from "@vercel/mcp-adapter";
import { registerAllTools } from "@/src/mcp/tools";
const handler = createMcpHandler((server) => registerAllTools(server), {}, { basePath: "/api/mcp" });
export const { GET, POST, DELETE } = handler;

// src/stdio-server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./mcp/tools/index.js";
const server = new McpServer({ name: "logo-mcp", version: "1.0.0" });
registerAllTools(server);
await server.connect(new StdioServerTransport());
console.error("Logo MCP Server running on stdio");  // stderr only!
```

---

## 9. Claude Desktop Configuration

### Config File Location

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

### stdio via npx (most user-friendly)

```json
{
  "mcpServers": {
    "logo-mcp": {
      "command": "npx",
      "args": ["-y", "logo-mcp"]
    }
  }
}
```

### stdio via node (local dev)

```json
{
  "mcpServers": {
    "logo-mcp": {
      "command": "node",
      "args": ["C:/absolute/path/to/logo-mcp/dist/stdio-server.js"]
    }
  }
}
```

### Remote HTTP server

```json
{
  "mcpServers": {
    "logo-mcp": {
      "url": "https://logo-mcp.vercel.app/api/mcp"
    }
  }
}
```

### Troubleshooting

- macOS logs: `~/Library/Logs/Claude/mcp*.log`
- Windows logs: `%APPDATA%\Claude\logs\mcp*.log`
- Paths must be absolute (no `~` or relative)
- `console.log()` in stdio mode → silent protocol corruption

---

## 10. Testing MCP Servers

### MCP Inspector (Official Tool)

```bash
# Test local stdio server
npx @modelcontextprotocol/inspector node dist/stdio-server.js

# Test via npx package
npx @modelcontextprotocol/inspector npx logo-mcp

# Test HTTP server (run dev first)
# Start dev server: npm run dev
# Then connect Inspector to http://localhost:3000/api/mcp
```

Opens at `http://localhost:5173` — UI with Tools, Resources, Prompts tabs.

### curl Testing for HTTP Transport

```bash
# Initialize session
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2025-11-25" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'

# List tools (use session ID from init response)
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2025-11-25" \
  -H "MCP-Session-Id: <session-id>" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

# Call search_logo
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2025-11-25" \
  -H "MCP-Session-Id: <session-id>" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_logo","arguments":{"query":"stripe"}}}'
```

---

## 11. Real-World Reference Implementations

### Filesystem Server (best simple reference)

```bash
npx -y @modelcontextprotocol/server-filesystem /path/to/dir
```

Source: https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem

Pattern: Pure tools, no resources/prompts. `read_file`, `write_file`, `list_directory`.
The logo-mcp server has a very similar shape — tools with slug/path-like identifiers.

### Everything Server (all three primitives)

```bash
npx -y @modelcontextprotocol/server-everything
```

Has tools + resources + prompts together — good for understanding how they interact.

---

## 12. Recommended Architecture

### Final Project Structure

```
logo-mcp/
├── app/
│   ├── api/
│   │   ├── mcp/
│   │   │   └── route.ts          ← Streamable HTTP MCP endpoint
│   │   └── logo/
│   │       └── [slug]/
│   │           └── route.ts      ← Direct SVG download endpoint
│   └── page.tsx                  ← Landing page with docs & demo
├── src/
│   ├── mcp/
│   │   ├── server.ts             ← createLogoMcpServer() factory
│   │   └── tools/
│   │       ├── search-logo.ts
│   │       ├── get-logo-svg.ts
│   │       ├── get-logo-url.ts
│   │       ├── list-logos.ts
│   │       ├── get-logo-metadata.ts
│   │       ├── download-logo.ts
│   │       └── index.ts          ← registerAllTools(server)
│   ├── lib/
│   │   └── simple-icons.ts       ← data loading / search / caching
│   └── stdio-server.ts           ← npx entrypoint for Claude Desktop
└── package.json                  ← "bin": { "logo-mcp": "dist/stdio-server.js" }
```

### Technology Stack

| Concern | Package | Rationale |
|---|---|---|
| MCP SDK | `@modelcontextprotocol/sdk` | Official SDK |
| Next.js adapter | `@vercel/mcp-adapter` | SSE + session mgmt on Vercel |
| Validation | `zod` | Schema + TypeScript inference |
| Icon data | `simple-icons` | Bundled, no CDN dependency for data |
| SVG serving | `cdn.simpleicons.org` | Color support, always latest |
| Session storage | `@vercel/kv` or Redis | Serverless SSE state persistence |

### Implementation Priority

1. **Phase 1 — Core (HTTP + 3 tools):** `search_logo`, `get_logo_svg`, `get_logo_metadata`
2. **Phase 2 — Full suite:** `get_logo_url`, `list_logos`, `download_logo` + resource template
3. **Phase 3 — stdio + npm publish:** Claude Desktop support, npx runnable, MCP Registry listing

### Critical Gotchas

1. `console.log()` in stdio mode = silent protocol corruption → always `console.error()`
2. Validate `Origin` header in HTTP mode (required by MCP spec for security)
3. Vercel serverless = ephemeral memory → use Redis/KV for SSE session state
4. Tool `description` strings are load-bearing — the LLM uses them to decide when to call
5. `isError: true` (not throw) for recoverable errors (wrong slug, not found)
6. Pass Zod schemas to `registerTool`, not raw JSON Schema objects
7. Set `runtime = "nodejs"` on the MCP route — Edge Runtime does not support SSE

---

## References

- MCP Specification (2025-11-25): https://modelcontextprotocol.io/specification/2025-11-25
- MCP Architecture: https://modelcontextprotocol.io/docs/learn/architecture
- Build an MCP Server: https://modelcontextprotocol.io/docs/develop/build-server
- Tools Spec: https://modelcontextprotocol.io/specification/2025-11-25/server/tools
- Resources Spec: https://modelcontextprotocol.io/specification/2025-11-25/server/resources
- MCP Inspector: https://github.com/modelcontextprotocol/inspector
- MCP Registry Quickstart: https://modelcontextprotocol.io/registry/quickstart
- @modelcontextprotocol/sdk: https://www.npmjs.com/package/@modelcontextprotocol/sdk
- @vercel/mcp-adapter: https://www.npmjs.com/package/@vercel/mcp-adapter
- Reference Implementations: https://github.com/modelcontextprotocol/servers
- Simple Icons CDN: https://simpleicons.org
