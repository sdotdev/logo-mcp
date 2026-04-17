import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect(new URL("/icons", "http://localhost:3000"));
}

export const dynamic = "force-dynamic";