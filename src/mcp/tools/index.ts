import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSearchLogo } from "./search-logo";
import { registerGetLogoSvg } from "./get-logo-svg";
import { registerGetLogoMetadata } from "./get-logo-metadata";

export function registerAllTools(server: McpServer): void {
  registerSearchLogo(server);
  registerGetLogoSvg(server);
  registerGetLogoMetadata(server);
}
