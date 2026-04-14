import { searchIcons } from "@/src/lib/simple-icons";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;

  if (!query) {
    return Response.json({ error: "Query parameter required" }, { status: 400 });
  }

  try {
    const results = await searchIcons(query, limit);
    return Response.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
