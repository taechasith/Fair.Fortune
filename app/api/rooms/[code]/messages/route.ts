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
  const visibility = body?.visibility === "private" ? "private" : "room";
  if (!text && !imageDataUrl) {
    return NextResponse.json({ error: "text or imageDataUrl is required" }, { status: 400 });
  }

  const senderRole = room.giverUserId === user.id ? "giver" : "receiver";
  let privateToUserId: string | undefined;
  if (visibility === "private") {
    privateToUserId = senderRole === "giver" ? room.receiverUserId : room.giverUserId;
    if (!privateToUserId) {
      return NextResponse.json({ error: "No second participant in room for private message" }, { status: 400 });
    }
  }

  const updated = addRoomMessage(
    room,
    senderRole,
    user.id,
    text || "[Transfer slip attached]",
    imageDataUrl,
    visibility,
    privateToUserId
  );
  const visibleMessages = updated.messages.filter((message) => {
    const messageVisibility = message.visibility ?? "room";
    if (messageVisibility === "room") return true;
    return message.senderUserId === user.id || message.privateToUserId === user.id;
  });
  return NextResponse.json({ room: { ...updated, messages: visibleMessages } });
}
