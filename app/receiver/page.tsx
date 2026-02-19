"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { fetchWithAuth, parseErrorText } from "@/lib/client/session";
import { useAuthUser } from "@/lib/client/use-auth-user";
import { computeAllocation } from "@/lib/math/engine";
import { useScenarioState } from "@/lib/state/useScenarioState";
import { CollaborationRoom } from "@/lib/types/collab";
import { formatMoney } from "@/lib/utils";

export default function ReceiverPage() {
  const { recipients, settings, lastResult } = useScenarioState();
  const result = useMemo(() => lastResult ?? computeAllocation(recipients, settings), [lastResult, recipients, settings]);
  const [recipientId, setRecipientId] = useState<string>(recipients[0]?.id ?? "");
  const { user, loading: userLoading } = useAuthUser();

  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState<CollaborationRoom>();
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selected = result.allocations.find((x) => x.recipientId === recipientId) ?? result.allocations[0];

  async function refreshRoom(code: string) {
    const response = await fetchWithAuth(`/api/rooms/${code}`);
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(parseErrorText(payload));
    }
    const nextRoom = payload.room as CollaborationRoom;
    setRoom(nextRoom);
    if (nextRoom.bankDetails) {
      setBankName(nextRoom.bankDetails.bankName);
      setAccountName(nextRoom.bankDetails.accountName);
      setAccountNumber(nextRoom.bankDetails.accountNumber);
    }
  }

  useEffect(() => {
    if (!roomCode) return;
    const timer = setInterval(() => {
      refreshRoom(roomCode).catch(() => undefined);
    }, 2500);
    return () => clearInterval(timer);
  }, [roomCode]);

  async function joinRoom() {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithAuth("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode: roomCodeInput })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(parseErrorText(payload));
      }
      const joined = payload.room as CollaborationRoom;
      setRoomCode(joined.code);
      setRoom(joined);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not join room");
    } finally {
      setLoading(false);
    }
  }

  async function saveBankDetails() {
    if (!roomCode) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithAuth(`/api/rooms/${roomCode}/bank`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankName, accountName, accountNumber })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(parseErrorText(payload));
      }
      setRoom(payload.room as CollaborationRoom);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not save bank details");
    } finally {
      setLoading(false);
    }
  }

  async function saveNote() {
    if (!roomCode) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithAuth(`/api/rooms/${roomCode}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: note })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(parseErrorText(payload));
      }
      setRoom(payload.room as CollaborationRoom);
      setNote("");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not save note");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!roomCode) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithAuth(`/api/rooms/${roomCode}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(parseErrorText(payload));
      }
      setRoom(payload.room as CollaborationRoom);
      setMessage("");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not send message");
    } finally {
      setLoading(false);
    }
  }

  if (userLoading) {
    return <div className="text-sm text-[#5f5148]">Loading session...</div>;
  }

  if (!user) {
    return (
      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Login required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-[#5f5148]">Please login to save gratitude notes and bank details to server.</p>
          <Link href="/login" className="text-sm font-semibold text-[#7A0C1B] underline">
            Open Login Page
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#7A0C1B]">Receiver Mode</h1>
      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Join with Room Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={roomCodeInput} onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())} placeholder="ABC123" />
          <Button disabled={loading || !roomCodeInput} onClick={joinRoom}>
            Join room
          </Button>
          {roomCode && <p className="text-sm text-[#7A0C1B]">Connected room: {roomCode}</p>}
          {error && <p className="text-sm text-[#C8102E]">{error}</p>}
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Why This Amount?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label className="text-[#7A0C1B]">Recipient</Label>
          <Select value={selected?.recipientId} onChange={(e) => setRecipientId(e.target.value)}>
            {result.allocations.map((a) => (
              <option key={a.recipientId} value={a.recipientId}>
                {a.name}
              </option>
            ))}
          </Select>
          {selected && (
            <div className="cny-parchment cny-sparkle rounded-2xl p-4">
              <div className="text-lg font-semibold">{selected.name}</div>
              <div className="mt-4">
                <div className="text-xs uppercase tracking-[0.24em] text-[#7A0C1B]/70">Your Hongbao</div>
                <div className="mt-1 inline-block border-b-2 border-[#D4AF37] pb-1 text-4xl font-bold text-[#C8102E]">
                  {formatMoney(selected.rounded)}
                </div>
              </div>
              <div className="mt-3 text-sm text-[#5f5148]">{selected.explanation}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Receiver Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank name" />
          <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Account name" />
          <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account number" />
          <div>
            <Button disabled={loading || !roomCode} onClick={saveBankDetails}>
              Save bank details
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#D4AF37]/60 bg-[linear-gradient(145deg,#C8102E,#7A0C1B)] text-[#FDF6EC] shadow-[0_10px_24px_rgba(122,12,27,0.26)]">
        <CardHeader>
          <CardTitle>Gratitude Note (saved to server)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            className="border-[#D4AF37]/70 bg-[#FDF6EC] text-[#2B2B2B]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a thank-you note to the giver..."
          />
          <Button variant="secondary" disabled={loading || !roomCode || !note.trim()} onClick={saveNote}>
            Save gratitude note
          </Button>
          <div className="space-y-2">
            {room?.gratitudeNotes.map((item) => (
              <div key={item.id} className="rounded-xl border border-[#D4AF37]/35 p-3 text-sm text-[#FDF6EC]">
                <div className="font-semibold">{item.authorRole}</div>
                <div>{item.text}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Room Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Send message to giver" />
          <Button disabled={loading || !roomCode || !message.trim()} onClick={sendMessage}>
            Send message
          </Button>
          <div className="space-y-2">
            {room?.messages.map((item) => (
              <div key={item.id} className="rounded-xl border border-[#D4AF37]/35 p-3 text-sm">
                <div className="font-semibold text-[#7A0C1B]">{item.senderRole}</div>
                <div>{item.text}</div>
                {item.imageDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageDataUrl} alt="Transfer slip" className="mt-2 max-h-40 rounded-lg border" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
