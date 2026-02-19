import { NextRequest, NextResponse } from "next/server";
import { addRoomMessage, getRoom, userCanAccessRoom } from "@/lib/server/collabStore";
import { getAuthenticatedUser } from "@/lib/server/auth";

export async function POST(request: NextRequest, context: { params: { code: string } }) {
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

  const body = await request.json().catch(() => ({}));
  const text = String(body?.text ?? "").trim();
  const imageDataUrl = body?.imageDataUrl ? String(body.imageDataUrl) : undefined;
  if (!text && !imageDataUrl) {
    return NextResponse.json({ error: "text or imageDataUrl is required" }, { status: 400 });
  }

  const senderRole = room.giverUserId === user.id ? "giver" : "receiver";
  const updated = addRoomMessage(room, senderRole, user.id, text || "[Transfer slip attached]", imageDataUrl);
  return NextResponse.json({ room: updated });
}
