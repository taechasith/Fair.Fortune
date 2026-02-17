"use client";

import { ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { importState } from "@/lib/state/storage";
import { PersistedState } from "@/lib/types";

export function ImportJson({ onImport }: { onImport: (state: PersistedState) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const parsed = await importState(file);
    onImport(parsed);
  }

  return (
    <div className="flex items-center gap-2">
      <input ref={ref} hidden type="file" accept="application/json" onChange={onFile} />
      <Button variant="secondary" onClick={() => ref.current?.click()}>
        Import Data
      </Button>
    </div>
  );
}
