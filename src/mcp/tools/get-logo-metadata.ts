import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getIcon } from "@/src/lib/simple-icons";

export function registerGetLogoMetadata(server: McpServer): void {
  server.registerTool(
    "get_logo_metadata",
    {
      title: "Get Logo Metadata",
      description:
        "Get metadata for a brand logo including official hex color, brand guidelines URL, license info, and aliases. " +
        "Use search_logo first to find the correct slug.",
      inputSchema: z.object({
        slug: z
          .string()
          .describe("Simple Icons slug (e.g., 'github', 'stripe')"),
      }),
    },
    async ({ slug }) => {
      try {
        const icon = await getIcon(slug);

        if (!icon) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Logo not found: "${slug}". Use search_logo to find valid slugs.`,
              },
            ],
            isError: true,
          };
        }

        const metadata = {
          slug: icon.slug,
          title: icon.title,
          hex: `#${icon.hex}`,
          source: icon.source,
          ...(icon.guidelines && { guidelines: icon.guidelines }),
          ...(icon.license && { license: icon.license }),
          ...(icon.aliases && { aliases: icon.aliases }),
        };

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(metadata, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: "text" as const,
              text: `Error fetching metadata: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
