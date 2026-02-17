"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Recipient } from "@/lib/types";
import { Trash2 } from "lucide-react";

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
            value={r.age}
            onChange={(e) => update(r.id, { age: Number(e.target.value) })}
            placeholder="Age"
          />
          <Input
            className="col-span-2"
            type="number"
            value={r.min ?? ""}
            onChange={(e) =>
              update(r.id, {
                min: e.target.value === "" ? undefined : Number(e.target.value)
              })
            }
          />
          <Input
            className="col-span-3"
            type="number"
            value={r.max ?? ""}
            onChange={(e) =>
              update(r.id, {
                max: e.target.value === "" ? undefined : Number(e.target.value)
              })
            }
          />
          <Button className="col-span-1" variant="ghost" onClick={() => remove(r.id)}>
            <Trash2 className="h-4 w-4" />
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
