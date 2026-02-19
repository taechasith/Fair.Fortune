import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { joinRoom } from "@/lib/server/collabStore";

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const roomCode = String(body?.roomCode ?? "").trim();
  if (!roomCode) {
    return NextResponse.json({ error: "roomCode is required" }, { status: 400 });
  }

  try {
    const room = joinRoom(roomCode, user.id);
    const role = room.giverUserId === user.id ? "giver" : "receiver";
    const visibleMessages = room.messages.filter((message) => {
      const visibility = message.visibility ?? "room";
      if (visibility === "room") return true;
      return message.senderUserId === user.id || message.privateToUserId === user.id;
    });
    const visibleBankDetails = role === "giver" ? room.bankDetails : undefined;
    return NextResponse.json({
      room: { ...room, bankDetails: visibleBankDetails, messages: visibleMessages },
      role
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not join room";
    return NextResponse.json(
      { error: message },
      { status: message.includes("private") ? 403 : 404 }
    );
  }
}
