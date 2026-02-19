import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { getProjectForUser, saveProjectScenario } from "@/lib/server/collabStore";
import type { PersistedState } from "@/lib/types";

function looksLikeScenario(value: unknown): value is PersistedState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { recipients?: unknown; settings?: unknown };
  return Array.isArray(candidate.recipients) && typeof candidate.settings === "object";
}

function toProjectPayload(project: NonNullable<ReturnType<typeof getProjectForUser>>) {
  return {
    id: project.id,
    userId: project.userId,
    title: project.title,
    situation: project.situation,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    hasSavedScenario: Boolean(project.scenario),
    scenario: project.scenario
  };
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = getProjectForUser(context.params.id, user.id);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project: toProjectPayload(project) });
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const scenario = (body as { scenario?: unknown }).scenario;
  if (!looksLikeScenario(scenario)) {
    return NextResponse.json({ error: "scenario is required" }, { status: 400 });
  }

  try {
    const updated = saveProjectScenario(context.params.id, user.id, scenario);
    return NextResponse.json({ project: toProjectPayload(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save project scenario";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
