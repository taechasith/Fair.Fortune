"use client";

import { PersistedState } from "../types";
import { defaultRecipients, defaultSettings } from "./defaults";

const STORAGE_KEY = "fairfortune_state_v1";

export function defaultPersistedState(): PersistedState {
  return {
    recipients: defaultRecipients,
    settings: defaultSettings
  };
}

export function loadState(): PersistedState {
  if (typeof window === "undefined") return defaultPersistedState();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultPersistedState();

  try {
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      recipients: parsed.recipients ?? defaultRecipients,
      settings: parsed.settings ?? defaultSettings,
      lastResult: parsed.lastResult
    };
  } catch {
    return defaultPersistedState();
  }
}

export function saveState(state: PersistedState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportState(state: PersistedState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fairfortune-scenario.json";
  a.click();
  URL.revokeObjectURL(url);
}

export async function importState(file: File): Promise<PersistedState> {
  const text = await file.text();
  const parsed = JSON.parse(text) as PersistedState;
  return {
    recipients: parsed.recipients,
    settings: parsed.settings,
    lastResult: parsed.lastResult
  };
}