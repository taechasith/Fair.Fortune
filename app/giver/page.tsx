"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ImportJson } from "@/components/import-json";
import { RecipientTable } from "@/components/recipient-table";
import { ResultsPanel } from "@/components/results-panel";
import { SettingsPanel, SpendingStyle } from "@/components/settings-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithAuth, parseErrorText } from "@/lib/client/session";
import { useAuthUser } from "@/lib/client/use-auth-user";
import { computeAllocation } from "@/lib/math/engine";
import { exportState } from "@/lib/state/storage";
import { useScenarioState } from "@/lib/state/useScenarioState";
import { CollaborationRoom, Project } from "@/lib/types/collab";

export default function GiverPage() {
  const {
    recipients,
    settings,
    setRecipients,
    setSettings,
    lastResult,
    setLastResult,
    setAll,
    persisted
  } = useScenarioState();
  const { user, loading: userLoading } = useAuthUser();
  const [spendingStyle, setSpendingStyle] = useState<SpendingStyle>("auto");

  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [situation, setSituation] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [activeRoom, setActiveRoom] = useState<CollaborationRoom>();
  const [joinCode, setJoinCode] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messageVisibility, setMessageVisibility] = useState<"room" | "private">("private");
  const [slipDataUrl, setSlipDataUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authExpired, setAuthExpired] = useState(false);

  const canRun = useMemo(() => recipients.length > 0 && settings.budget >= 0, [recipients, settings.budget]);

  function applySpendingStyle() {
    if (spendingStyle === "balanced") {
      return recipients.map((r) => ({ ...r, roleFactor: 1 }));
    }
    if (spendingStyle === "younger") {
      return recipients.map((r) => ({
        ...r,
        roleFactor: r.age <= 18 ? 1.18 : r.age >= 55 ? 0.92 : 1
      }));
    }
    return recipients.map((r) => ({
      ...r,
      roleFactor: r.age <= 12 ? 1.2 : r.age <= 22 ? 1.08 : r.age >= 60 ? 1.1 : 1
    }));
  }

  const requestProjects = useCallback(async () => {
    const response = await fetchWithAuth("/api/projects");
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(parseErrorText(payload));
    }
    const nextProjects = (payload.projects as Project[]) ?? [];
    setProjects(nextProjects);
    const stillExists = nextProjects.some((project) => project.id === selectedProjectId);
    if (!stillExists) {
      setSelectedProjectId(nextProjects[0]?.id ?? "");
    }
  }, [selectedProjectId]);

  async function requestRoom(nextCode: string) {
    const response = await fetchWithAuth(`/api/rooms/${nextCode}`);
    const payload = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        setAuthExpired(true);
      }
      throw new Error(parseErrorText(payload));
    }
    setActiveRoom(payload.room as CollaborationRoom);
  }

  useEffect(() => {
    if (!user) return;
    requestProjects().catch(() => undefined);
  }, [user, requestProjects]);

  useEffect(() => {
    if (!roomCode) return;
    const timer = setInterval(() => {
      requestRoom(roomCode).catch(() => undefined);
    }, 2500);
    return () => clearInterval(timer);
  }, [roomCode]);

  async function createProject() {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithAuth("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, situation })
      });
      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setAuthExpired(true);
        }
        throw new Error(parseErrorText(payload));
      }
      const createdProject = payload.project as Project;
      setSelectedProjectId(createdProject.id);
      setTitle("");
      setSituation("");
      await requestProjects();

      const roomResponse = await fetchWithAuth("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: createdProject.id })
      });
      const roomPayload = await roomResponse.json();
      if (!roomResponse.ok) {
        throw new Error(parseErrorText(roomPayload));
      }
      const room = roomPayload.room as CollaborationRoom;
      setRoomCode(room.code);
      setActiveRoom(room);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not create project");
    } finally {
      setLoading(false);
    }
  }

  async function createRoomForProject() {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithAuth("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId })
      });
      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setAuthExpired(true);
        }
        throw new Error(parseErrorText(payload));
      }
      const room = payload.room as CollaborationRoom;
      setRoomCode(room.code);
      setActiveRoom(room);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not create room");
    } finally {
      setLoading(false);
    }
  }

  async function joinExistingRoom() {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithAuth("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode: joinCode })
      });
      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setAuthExpired(true);
        }
        throw new Error(parseErrorText(payload));
      }
      const room = payload.room as CollaborationRoom;
      setRoomCode(room.code);
      setActiveRoom(room);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not join room");
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
        body: JSON.stringify({
          text: messageText,
          imageDataUrl: slipDataUrl || undefined,
          visibility: messageVisibility
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setAuthExpired(true);
        }
        throw new Error(parseErrorText(payload));
      }
      setActiveRoom(payload.room as CollaborationRoom);
      setMessageText("");
      setSlipDataUrl("");
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
          <p className="text-sm text-[#5f5148]">Please login so your project and gratitude room data can be stored.</p>
          <Link href="/login" className="text-sm font-semibold text-[#7A0C1B] underline">
            Open Login Page
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#7A0C1B]">Giver Mode</h1>
      {authExpired && (
        <Card className="cny-panel border-[#C8102E]/50">
          <CardContent className="pt-5 text-sm text-[#7A0C1B]">
            Session expired. Please <Link href="/login" className="underline">login again</Link>.
          </CardContent>
        </Card>
      )}

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Create Project (family/work/custom)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Project title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Family CNY 2026" />
          </div>
          <div className="space-y-1">
            <Label>Situation</Label>
            <Input value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="family / work / custom" />
          </div>
          <div>
            <Button disabled={loading || !title || !situation} onClick={createProject}>
              Save project
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Room code connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1 md:col-span-2">
              <Label>Select project</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-[#D4AF37]/50 bg-[#FDF6EC] px-3 py-2 text-sm text-[#2B2B2B]"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title} - {project.situation}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button disabled={loading || !selectedProjectId} onClick={createRoomForProject}>
                Create room
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1 md:col-span-2">
              <Label>Join by room code</Label>
              <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="ABC123" />
            </div>
            <div className="flex items-end">
              <Button variant="secondary" disabled={loading || !joinCode} onClick={joinExistingRoom}>
                Join room
              </Button>
            </div>
          </div>

          {roomCode && <p className="text-sm text-[#7A0C1B]">Connected room code: {roomCode}</p>}
          {roomCode && (
            <div className="room-code-share flex flex-wrap items-center gap-2 rounded-xl border border-[#D4AF37]/45 bg-[#fffaf1] p-3">
              <span className="text-sm text-[#7A0C1B]">Share this room code:</span>
              <code className="room-code-pill rounded-md bg-[#7A0C1B] px-2 py-1 text-sm font-bold tracking-[0.12em] text-[#FDF6EC]">
                {roomCode}
              </code>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(roomCode);
                }}
              >
                Copy code
              </Button>
            </div>
          )}
          {error && <p className="text-sm text-[#C8102E]">{error}</p>}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="cny-panel">
          <CardHeader>
            <CardTitle>Who will receive?</CardTitle>
          </CardHeader>
          <CardContent>
            <RecipientTable recipients={recipients} onChange={setRecipients} />
          </CardContent>
        </Card>
        <Card className="cny-panel">
          <CardHeader>
            <CardTitle>How fair should it feel?</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsPanel
              settings={settings}
              onChange={setSettings}
              spendingStyle={spendingStyle}
              onSpendingStyleChange={setSpendingStyle}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          className="cny-shimmer"
          onClick={() => {
            if (!canRun) return;
            setLastResult(computeAllocation(applySpendingStyle(), settings));
          }}
        >
          Calculate
        </Button>
        <details className="rounded-xl border border-[#D4AF37]/45 px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-[#7A0C1B]">Advanced Tools</summary>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => exportState(persisted)}>
              Export Data
            </Button>
            <ImportJson onImport={setAll} />
          </div>
        </details>
      </div>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Simple Explanation</CardTitle>
        </CardHeader>
        <CardContent className="cny-parchment rounded-xl p-4">
          <ResultsPanel result={lastResult} budget={settings.budget} />
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Giver message + transfer slip upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Send as</Label>
            <Select
              value={messageVisibility}
              onChange={(e) => setMessageVisibility(e.target.value as "room" | "private")}
            >
              <option value="private">Private to receiver</option>
              <option value="room">Visible in room</option>
            </Select>
          </div>
          <Textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Message to receiver" />
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setSlipDataUrl(String(reader.result ?? ""));
              reader.readAsDataURL(file);
            }}
          />
          <Button disabled={loading || !roomCode || (!messageText && !slipDataUrl)} onClick={sendMessage}>
            Send to room
          </Button>
          <div className="space-y-2">
            {activeRoom?.messages.map((message) => (
              <div key={message.id} className="rounded-xl border border-[#D4AF37]/35 p-3 text-sm">
                <div className="font-semibold text-[#7A0C1B]">{message.senderRole}</div>
                <div className="text-xs text-[#5f5148]">
                  {message.visibility === "private" ? "Private message" : "Room message"}
                </div>
                <div className="text-[#2B2B2B]">{message.text}</div>
                {message.imageDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={message.imageDataUrl} alt="Transfer slip" className="mt-2 max-h-40 rounded-lg border" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
