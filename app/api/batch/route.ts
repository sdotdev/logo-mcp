import { getIcons } from "@/src/lib/simple-icons";
import { getBrandResolver } from "@/src/lib/brand-resolver";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inputs = [], color } = body;

    if (!Array.isArray(inputs) || inputs.length === 0) {
      return NextResponse.json(
        { error: "Inputs array is required" },
        { status: 400 }
      );
    }

    const icons = await getIcons();
    const resolver = getBrandResolver();
    resolver.initialize(icons);

    const results = resolver.resolveBatch(inputs);

    for (const result of results) {
      if (result.found) {
        const icon = icons.find(i => i.slug === result.slug);
        if (icon) {
          let svg = icon.svg;
          if (color) {
            const hexColor = color.startsWith("#") ? color : `#${color}`;
            svg = svg.replace("<svg ", `<svg fill="${hexColor}" `);
          }
          result.svg = svg;
          result.sourceUrl = icon.source;
        }
      }
    }

    const found = results.filter(r => r.found);
    const notFound = results.filter(r => !r.found).map(r => r.input);

    return NextResponse.json({
      results,
      found: found.length,
      notFound,
      summary: `Found ${found.length} of ${inputs.length} brands`,
    });
  } catch (error) {
    console.error("Batch API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";