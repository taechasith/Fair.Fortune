import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { getRoom, saveRoomBankDetails, userCanAccessRoom } from "@/lib/server/collabStore";

export async function PATCH(request: NextRequest, context: { params: { code: string } }) {
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
  const bankName = String(body?.bankName ?? "").trim();
  const accountName = String(body?.accountName ?? "").trim();
  const accountNumber = String(body?.accountNumber ?? "").trim();
  if (!bankName || !accountName || !accountNumber) {
    return NextResponse.json({ error: "bankName, accountName and accountNumber are required" }, { status: 400 });
  }

  try {
    const updated = saveRoomBankDetails(room, user.id, { bankName, accountName, accountNumber });
    return NextResponse.json({ room: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save bank details" },
      { status: 400 }
    );
  }
}
