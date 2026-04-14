import { searchIcons, getIcon } from "@/src/lib/simple-icons";
import { z } from "zod";

// Tool definitions with handlers
const tools = [
  {
    name: "search_logo",
    description:
      "Search for brand logos by name. Returns matching logos with slugs, titles, and brand hex colors.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Brand name to search for (e.g. 'stripe', 'github')",
        },
        limit: {
          type: "number",
          description: "Maximum number of results (default: 10, max: 50)",
        },
      },
      required: ["query"],
    },
    handler: async (args: Record<string, unknown>) => {
      const query = args.query as string;
      const limit = Math.min((args.limit as number) || 10, 50);

      const results = await searchIcons(query, limit);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No logos found matching "${query}".`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "get_logo_svg",
    description: "Retrieve the raw SVG markup for a brand logo by its slug.",
    inputSchema: {
      type: "object" as const,
      properties: {
        slug: {
          type: "string",
          description: "Simple Icons slug (e.g. 'github', 'stripe')",
        },
        color: {
          type: "string",
          description: "Hex color override (e.g. 'FF0000' or '#FF0000')",
        },
      },
      required: ["slug"],
    },
    handler: async (args: Record<string, unknown>) => {
      const slug = args.slug as string;
      const color = args.color as string | undefined;

      const icon = await getIcon(slug);

      if (!icon) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Logo not found for slug: "${slug}"`,
            },
          ],
          isError: true,
        };
      }

      let svg = icon.svg;

      if (color) {
        const hexColor = color.startsWith("#") ? color : `#${color}`;
        svg = svg.replace("<svg ", `<svg fill="${hexColor}" `);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: svg,
          },
        ],
      };
    },
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle initialize
    if (body.method === "initialize") {
      return Response.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          protocolVersion: "2025-11-25",
          capabilities: {
            tools: {},
            resources: {},
            prompts: {},
          },
          serverInfo: {
            name: "logo-mcp",
            version: "1.0.0",
          },
        },
      });
    }

    // Handle tools/list
    if (body.method === "tools/list") {
      return Response.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          tools: tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
          })),
        },
      });
    }

    // Handle tools/call
    if (body.method === "tools/call") {
      const { name, arguments: args } = body.params;

      const tool = tools.find((t) => t.name === name);
      if (!tool) {
        return Response.json(
          {
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32601, message: `Unknown tool: ${name}` },
          },
          { status: 404 }
        );
      }

      const result = await tool.handler(args || {});

      return Response.json({
        jsonrpc: "2.0",
        id: body.id,
        result,
      });
    }

    return Response.json(
      {
        jsonrpc: "2.0",
        id: body.id,
        error: { code: -32601, message: `Unknown method: ${body.method}` },
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("MCP Error:", error);
    return Response.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Internal error",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    name: "logo-mcp",
    version: "1.0.0",
    description: "MCP server for Simple Icons logo library",
    tools: tools.length,
  });
}

// Required for Vercel/Next.js
export const runtime = "nodejs";
export const maxDuration = 60;
