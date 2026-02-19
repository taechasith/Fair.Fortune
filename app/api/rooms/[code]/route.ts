import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { getRoom, userCanAccessRoom } from "@/lib/server/collabStore";

export async function GET(request: NextRequest, context: { params: { code: string } }) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const room = getRoom(context.params.code);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (!userCanAccessRoom(room, user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const role = room.giverUserId === user.id ? "giver" : "receiver";
  return NextResponse.json({ room, role });
}
