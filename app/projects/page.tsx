"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchWithAuth, parseErrorText } from "@/lib/client/session";
import { useAuthUser } from "@/lib/client/use-auth-user";
import { useScenarioState } from "@/lib/state/useScenarioState";
import { Project } from "@/lib/types/collab";

export default function ProjectsPage() {
  const { user, loading: userLoading } = useAuthUser();
  const { persisted, setAll } = useScenarioState();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [situation, setSituation] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refreshProjects = useCallback(async () => {
    const response = await fetchWithAuth("/api/projects");
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(parseErrorText(payload));
    }
    const next = (payload.projects as Project[]) ?? [];
    setProjects(next);
    if (!selectedProjectId || !next.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(next[0]?.id ?? "");
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (!user) return;
    refreshProjects().catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load projects"));
  }, [user, refreshProjects]);

  async function createProject() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetchWithAuth("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, situation })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(parseErrorText(payload));
      }
      const created = payload.project as Project;
      setSelectedProjectId(created.id);
      setTitle("");
      setSituation("");
      await refreshProjects();
      setMessage("Project created.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create project");
    } finally {
      setSaving(false);
    }
  }

  async function saveCurrentScenario() {
    if (!selectedProjectId) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetchWithAuth(`/api/projects/${selectedProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: persisted })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(parseErrorText(payload));
      }
      await refreshProjects();
      setMessage("Current scenario saved to project.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save project");
    } finally {
      setSaving(false);
    }
  }

  async function openSavedScenario() {
    if (!selectedProjectId) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetchWithAuth(`/api/projects/${selectedProjectId}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(parseErrorText(payload));
      }
      const project = payload.project as { scenario?: unknown; title?: string };
      if (!project.scenario) {
        throw new Error("No saved scenario in this project yet.");
      }
      setAll(project.scenario as typeof persisted);
      setMessage(`Loaded project: ${project.title ?? "Untitled"}`);
      router.push("/giver");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not open project");
    } finally {
      setSaving(false);
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
          <p className="text-sm text-[#5f5148]">Please login to save and reopen projects.</p>
          <Link href="/login" className="text-sm font-semibold text-[#7A0C1B] underline">
            Open Login Page
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#7A0C1B]">Projects</h1>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Create Project</CardTitle>
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
            <Button disabled={saving || !title || !situation} onClick={createProject}>
              Create project
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Save / Reopen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            className="flex h-10 w-full rounded-xl border border-[#D4AF37]/50 bg-[#FDF6EC] px-3 py-2 text-sm text-[#2B2B2B]"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title} - {project.situation} {project.hasSavedScenario ? "(saved)" : "(empty)"}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            <Button disabled={saving || !selectedProjectId} onClick={saveCurrentScenario}>
              Save current scenario
            </Button>
            <Button variant="secondary" disabled={saving || !selectedProjectId} onClick={openSavedScenario}>
              Open saved scenario
            </Button>
            <Button variant="secondary" onClick={() => router.push("/giver")}>
              Go to Giver Mode
            </Button>
          </div>
          {message && <p className="text-sm text-[#7A0C1B]">{message}</p>}
          {error && <p className="text-sm text-[#C8102E]">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
