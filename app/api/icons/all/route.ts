import { getIcons } from "@/src/lib/simple-icons";

export async function GET() {
  try {
    const icons = await getIcons();
    return Response.json(icons);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
