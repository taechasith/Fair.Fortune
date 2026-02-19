import { NextRequest } from "next/server";
import { getUserBySessionToken } from "./collabStore";

export function getTokenFromRequest(request: NextRequest): string | undefined {
  const header = request.headers.get("x-session-token");
  if (header) return header;
  return request.cookies.get("fairfortune_session")?.value;
}

export function getAuthenticatedUser(request: NextRequest) {
  return getUserBySessionToken(getTokenFromRequest(request));
}
