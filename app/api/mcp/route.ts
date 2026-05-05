import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerAllTools } from "@/src/mcp/tools/index";

async function handleRequest(request: Request): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    // Stateless mode: required for Vercel serverless (no in-memory session between invocations)
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  const server = new McpServer({
    name: "logo-mcp",
    version: "1.0.0",
  });

  registerAllTools(server);
  await server.connect(transport);
  return transport.handleRequest(request);
}

export const GET = handleRequest;
export const POST = handleRequest;
export const DELETE = handleRequest;

export const runtime = "nodejs";
export const maxDuration = 60;
