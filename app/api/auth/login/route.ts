import { NextResponse } from "next/server";
import { createSession, loginUser, sanitizeUser } from "@/lib/server/collabStore";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "").trim();

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  try {
    const user = loginUser(email, password);
    const session = createSession(user.id);
    const response = NextResponse.json({
      token: session.token,
      user: sanitizeUser(user)
    });
    response.cookies.set("fairfortune_session", session.token, {
      httpOnly: false,
      sameSite: "lax",
      path: "/"
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not login" },
      { status: 401 }
    );
  }
}
