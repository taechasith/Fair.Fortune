"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { computeAllocation } from "@/lib/math/engine";
import { useScenarioState } from "@/lib/state/useScenarioState";
import { formatMoney } from "@/lib/utils";

export default function ReceiverPage() {
  const { recipients, settings, lastResult } = useScenarioState();
  const result = useMemo(() => lastResult ?? computeAllocation(recipients, settings), [lastResult, recipients, settings]);
  const [recipientId, setRecipientId] = useState<string>(recipients[0]?.id ?? "");
  const [note, setNote] = useState("");

  const selected = result.allocations.find((x) => x.recipientId === recipientId) ?? result.allocations[0];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#7A0C1B]">Receiver Mode</h1>
      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Why This Amount?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label className="text-[#7A0C1B]">Recipient</Label>
          <Select value={selected?.recipientId} onChange={(e) => setRecipientId(e.target.value)}>
            {result.allocations.map((a) => (
              <option key={a.recipientId} value={a.recipientId}>
                {a.name}
              </option>
            ))}
          </Select>
          {selected && (
            <div className="cny-parchment cny-sparkle rounded-2xl p-4">
              <div className="text-lg font-semibold">{selected.name}</div>
              <div className="mt-4">
                <div className="text-xs uppercase tracking-[0.24em] text-[#7A0C1B]/70">Your Hongbao</div>
                <div className="mt-1 inline-block border-b-2 border-[#D4AF37] pb-1 text-4xl font-bold text-[#C8102E] drop-shadow-[0_0_8px_rgba(200,16,46,0.2)]">
                  🧧 {formatMoney(selected.rounded)}
                </div>
              </div>
              <div className="mt-3 text-sm text-[#5f5148]">This amount is based on:</div>
              <ul className="mt-1 space-y-1 text-sm text-[#5f5148]">
                <li>Your age</li>
                <li>The total budget</li>
                <li>The fairness level chosen</li>
              </ul>
              <div className="mt-3 text-sm text-[#5f5148]">{selected.explanation}</div>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-[#7A0C1B]">See detailed explanation</summary>
                <div className="mt-2 text-xs text-[#5f5148]">
                  Planned before rounding: {formatMoney(selected.continuous)}
                </div>
                <div className="text-xs text-[#5f5148]">Final amount after rounding: {formatMoney(selected.rounded)}</div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#D4AF37]/60 bg-[linear-gradient(145deg,#C8102E,#7A0C1B)] text-[#FDF6EC] shadow-[0_10px_24px_rgba(122,12,27,0.26)]">
        <CardHeader>
          <CardTitle>Gratitude Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            className="border-[#D4AF37]/70 bg-[#FDF6EC] text-[#2B2B2B]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a thank-you note to the giver..."
          />
          <div className="text-xs text-[#F8EFD8]">Saved locally in browser session only.</div>
        </CardContent>
      </Card>
    </div>
  );
}
