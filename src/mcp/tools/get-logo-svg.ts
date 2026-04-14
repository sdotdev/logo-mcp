import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getIcon, colorSvg } from "@/src/lib/simple-icons";

export function registerGetLogoSvg(server: McpServer): void {
  server.registerTool(
    "get_logo_svg",
    {
      title: "Get Logo SVG",
      description:
        "Retrieve the raw SVG markup for a brand logo by its Simple Icons slug. " +
        "Returns SVG string ready to embed in HTML/CSS. Use search_logo first to find the slug.",
      inputSchema: z.object({
        slug: z
          .string()
          .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with optional hyphens")
          .describe(
            "Simple Icons slug (e.g. 'github', 'stripe', 'aws', 'amazon-web-services')"
          ),
        color: z
          .string()
          .regex(/^#?[0-9a-fA-F]{6}$/, "Color must be a valid 6-digit hex code")
          .optional()
          .describe(
            "Override fill color as hex (e.g. '#FF0000' or 'FF0000' for red). Defaults to brand color."
          ),
      }),
    },
    async ({ slug, color }) => {
      try {
        const icon = await getIcon(slug);

        if (!icon) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Logo not found for slug: "${slug}". Try search_logo to find valid slugs.`,
              },
            ],
            isError: true,
          };
        }

        let svg = icon.svg;

        if (color) {
          svg = colorSvg(svg, color);
        }

        return {
          content: [
            {
              type: "text" as const,
              text: svg,
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: "text" as const,
              text: `Error retrieving logo: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
