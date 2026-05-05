import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/icons", request.url));
}

export const dynamic = "force-dynamic";