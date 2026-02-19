import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/server/auth";
import { removeSession } from "@/lib/server/collabStore";

export async function POST(request: NextRequest) {
  removeSession(getTokenFromRequest(request));
  const response = NextResponse.json({ ok: true });
  response.cookies.set("fairfortune_session", "", {
    path: "/",
    maxAge: 0
  });
  return response;
}
