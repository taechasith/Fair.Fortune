"use client";

import { AuthUser } from "@/lib/types/collab";

const SESSION_KEY = "fairfortune_session_token_v1";

export function getSessionToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(SESSION_KEY) ?? "";
}

export function setSessionToken(token: string): void {
  if (typeof window === "undefined") return;
  if (!token) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, token);
}

export function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { "x-session-token": token } : {};
}

export async function fetchWithAuth(url: string, init?: RequestInit): Promise<Response> {
  const headers = {
    ...(init?.headers ?? {}),
    ...authHeaders()
  };
  return fetch(url, { ...init, headers });
}

export function parseErrorText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "Request failed";
  const maybeMessage = (payload as { error?: unknown }).error;
  return typeof maybeMessage === "string" ? maybeMessage : "Request failed";
}

export interface AuthPayload {
  token: string;
  user: AuthUser;
}
