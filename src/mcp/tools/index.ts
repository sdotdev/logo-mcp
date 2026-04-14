import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSearchLogo } from "./search-logo";
import { registerGetLogoSvg } from "./get-logo-svg";

/**
 * Register all MCP tools for the logo server
 */
export function registerAllTools(server: McpServer): void {
  registerSearchLogo(server);
  registerGetLogoSvg(server);
}
