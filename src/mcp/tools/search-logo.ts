import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchIcons } from "@/src/lib/simple-icons";

export function registerSearchLogo(server: McpServer): void {
  server.registerTool(
    "search_logo",
    {
      title: "Search Logos",
      description:
        "Search for brand logos by name. Returns matching logos with their slugs, official titles, " +
        "and brand hex colors. Use this to find the correct slug before calling get_logo_svg.",
      inputSchema: z.object({
        query: z
          .string()
          .min(1)
          .describe(
            "Brand name or keyword to search for (e.g. 'stripe', 'github', 'amazon web services')"
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .default(10)
          .describe("Maximum number of results to return (default: 10, max: 50)"),
      }),
    },
    async ({ query, limit }) => {
      try {
        const results = await searchIcons(query, limit);

        if (results.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No logos found matching "${query}". Try a different search term or brand name.`,
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
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: "text" as const,
              text: `Error searching logos: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
