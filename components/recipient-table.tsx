"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rolePresetFactors } from "@/lib/state/defaults";
import { Recipient, RolePreset } from "@/lib/types";
import { Trash2 } from "lucide-react";

const presets: RolePreset[] = ["child", "teen", "student", "adult", "elder"];

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
        <div className="col-span-2">Name</div>
        <div className="col-span-1">Age</div>
        <div className="col-span-2">Preset</div>
        <div className="col-span-2">Role Factor</div>
        <div className="col-span-2">Min</div>
        <div className="col-span-2">Max</div>
        <div className="col-span-1">Delete</div>
      </div>
      {recipients.map((r) => (
        <div key={r.id} className="grid grid-cols-12 gap-2">
          <Input
            className="col-span-2"
            value={r.name}
            onChange={(e) => update(r.id, { name: e.target.value })}
          />
          <Input
            className="col-span-1"
            type="number"
            value={r.age}
            onChange={(e) => update(r.id, { age: Number(e.target.value) })}
          />
          <select
            className="col-span-2 h-10 rounded-xl border border-[#D4AF37]/50 bg-[#FDF6EC] px-2 text-sm text-[#2B2B2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            value={r.preset}
            onChange={(e) => {
              const preset = e.target.value as RolePreset;
              update(r.id, { preset, roleFactor: rolePresetFactors[preset] });
            }}
          >
            {presets.map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
          <Input
            className="col-span-2"
            type="number"
            step="0.01"
            value={r.roleFactor}
            onChange={(e) => update(r.id, { roleFactor: Number(e.target.value) })}
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
            className="col-span-2"
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
          Add Recipient
        </Button>
      </div>
      <Label className="text-xs">Quick presets auto-fill role factors.</Label>
    </div>
  );
}
