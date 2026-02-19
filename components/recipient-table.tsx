"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Recipient } from "@/lib/types";
import { clamp } from "@/lib/utils";
import { Trash2 } from "lucide-react";

const MIN_AGE = 0;
const MAX_AGE = 120;
const MIN_AMOUNT = 0;
const MAX_AMOUNT = 100000;

export function RecipientTable({
  recipients,
  onChange
}: {
  recipients: Recipient[];
  onChange: (next: Recipient[]) => void;
}) {
  function update(id: string, patch: Partial<Recipient>) {
    onChange(recipients.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function parseNumber(value: string): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function remove(id: string) {
    onChange(recipients.filter((r) => r.id !== id));
  }

  function addRecipient() {
    const id = `r-${Date.now()}`;
    onChange([
      ...recipients,
      { id, name: "", age: 18, roleFactor: 1, preset: "adult", min: undefined, max: undefined }
    ]);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-[#7A0C1B]/85">
        <div className="col-span-4">Name</div>
        <div className="col-span-2">Age</div>
        <div className="col-span-2">Minimum</div>
        <div className="col-span-3">Maximum</div>
        <div className="col-span-1">Delete</div>
      </div>
      {recipients.map((r) => (
        <div key={r.id} className="grid grid-cols-12 gap-2">
          <Input
            className="col-span-4"
            value={r.name}
            onChange={(e) => update(r.id, { name: e.target.value })}
            placeholder="Person name"
          />
          <Input
            className="col-span-2"
            type="number"
            min={MIN_AGE}
            max={MAX_AGE}
            step={1}
            value={r.age}
            onChange={(e) => {
              const parsed = parseNumber(e.target.value);
              if (parsed === null) return;
              update(r.id, { age: clamp(parsed, MIN_AGE, MAX_AGE) });
            }}
            placeholder="Age"
          />
          <Input
            className="col-span-2"
            type="number"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step={1}
            value={r.min ?? ""}
            onChange={(e) => {
              if (e.target.value === "") {
                update(r.id, { min: undefined });
                return;
              }
              const parsed = parseNumber(e.target.value);
              if (parsed === null) return;
              const nextMin = clamp(parsed, MIN_AMOUNT, MAX_AMOUNT);
              update(r.id, {
                min: nextMin,
                max: r.max !== undefined ? Math.max(r.max, nextMin) : undefined
              });
            }}
          />
          <Input
            className="col-span-3"
            type="number"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step={1}
            value={r.max ?? ""}
            onChange={(e) => {
              if (e.target.value === "") {
                update(r.id, { max: undefined });
                return;
              }
              const parsed = parseNumber(e.target.value);
              if (parsed === null) return;
              const nextMax = clamp(parsed, MIN_AMOUNT, MAX_AMOUNT);
              update(r.id, {
                max: r.min !== undefined ? Math.max(nextMax, r.min) : nextMax
              });
            }}
          />
          <Button
            className="col-span-1 h-10 w-full min-w-[2.75rem] px-0"
            variant="ghost"
            onClick={() => remove(r.id)}
            aria-label={`Delete ${r.name || "person"}`}
            title="Delete person"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      ))}
      <div>
        <Button variant="secondary" onClick={addRecipient}>
          Add Person
        </Button>
      </div>
      <Label className="text-xs text-[#5f5148]">
        Tip: Use min or max only if you need a lower or upper limit for someone.
      </Label>
    </div>
  );
}
