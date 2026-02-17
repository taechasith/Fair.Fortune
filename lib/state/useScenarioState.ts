"use client";

import { useEffect, useMemo, useState } from "react";
import { AllocationResult, PersistedState, Recipient, ScenarioSettings } from "../types";
import { defaultPersistedState, loadState, saveState } from "./storage";

export function useScenarioState(): {
  recipients: Recipient[];
  settings: ScenarioSettings;
  lastResult?: AllocationResult;
  setRecipients: (next: Recipient[]) => void;
  setSettings: (next: ScenarioSettings) => void;
  setLastResult: (next?: AllocationResult) => void;
  setAll: (next: PersistedState) => void;
  persisted: PersistedState;
} {
  const [persisted, setPersisted] = useState<PersistedState>(defaultPersistedState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPersisted(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(persisted);
  }, [persisted, hydrated]);

  const api = useMemo(
    () => ({
      recipients: persisted.recipients,
      settings: persisted.settings,
      lastResult: persisted.lastResult,
      setRecipients: (next: Recipient[]) => setPersisted((prev) => ({ ...prev, recipients: next })),
      setSettings: (next: ScenarioSettings) => setPersisted((prev) => ({ ...prev, settings: next })),
      setLastResult: (next?: AllocationResult) =>
        setPersisted((prev) => ({ ...prev, lastResult: next })),
      setAll: (next: PersistedState) => setPersisted(next),
      persisted
    }),
    [persisted]
  );

  return api;
}
