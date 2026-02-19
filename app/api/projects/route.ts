import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { createProject, listProjects } from "@/lib/server/collabStore";

function toProjectSummary(project: ReturnType<typeof listProjects>[number]) {
  return {
    id: project.id,
    userId: project.userId,
    title: project.title,
    situation: project.situation,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    hasSavedScenario: Boolean(project.scenario)
  };
}

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ projects: listProjects(user.id).map(toProjectSummary) });
}

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim();
  const situation = String(body?.situation ?? "").trim();

  if (!title || !situation) {
    return NextResponse.json({ error: "title and situation are required" }, { status: 400 });
  }

  const project = createProject(user.id, title, situation);
  return NextResponse.json({ project: toProjectSummary(project) }, { status: 201 });
}
