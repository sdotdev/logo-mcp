import { getIcons } from "@/src/lib/simple-icons";
import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandsParam = searchParams.get("brands");

    if (!brandsParam) {
      return NextResponse.json(
        { error: "brands parameter is required" },
        { status: 400 }
      );
    }

    const slugs = brandsParam.split(",").map(s => s.trim()).filter(Boolean);
    
    if (slugs.length === 0) {
      return NextResponse.json(
        { error: "At least one brand is required" },
        { status: 400 }
      );
    }

    const icons = await getIcons();
    const iconMap = new Map(icons.map(i => [i.slug.toLowerCase(), i]));

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const stream = new ReadableStream({
      start(controller) {
        archive.on("data", (chunk: Buffer) => {
          controller.enqueue(chunk);
        });
        archive.on("end", () => {
          controller.close();
        });
        archive.on("error", (err: Error) => {
          controller.error(err);
        });
      },
    });

    let hasFiles = false;

    for (const slug of slugs) {
      const icon = iconMap.get(slug.toLowerCase());
      if (icon) {
        archive.append(icon.svg, { name: `${slug}.svg` });
        hasFiles = true;
      }
    }

    if (!hasFiles) {
      return NextResponse.json(
        { error: "No valid logos found for the provided brands" },
        { status: 404 }
      );
    }

    archive.finalize();

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="logos-${slugs.join("-")}.zip"`,
      },
    });
  } catch (error) {
    console.error("Batch download error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";