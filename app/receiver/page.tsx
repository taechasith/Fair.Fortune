"use client";

import { useMemo, useState } from "react";
import { AgeCurveChart } from "@/components/age-curve-chart";
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
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Receiver Mode</h1>
      <Card>
        <CardHeader>
          <CardTitle>Why This Amount?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>Recipient</Label>
          <Select value={selected?.recipientId} onChange={(e) => setRecipientId(e.target.value)}>
            {result.allocations.map((a) => (
              <option key={a.recipientId} value={a.recipientId}>
                {a.name}
              </option>
            ))}
          </Select>
          {selected && (
            <div className="rounded-md border p-3">
              <div className="text-lg font-semibold">{selected.name}</div>
              <div>Final hongbao: {formatMoney(selected.rounded)}</div>
              <div className="text-sm text-muted-foreground">{selected.explanation}</div>
              <div className="text-sm">Age-curve contribution: {selected.ageWeight.toFixed(3)}</div>
              <div className="text-sm">Blended weight: {selected.blendedWeight.toFixed(3)}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Age Curve Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <AgeCurveChart anchors={settings.anchorPoints} model={settings.solverSettings.ageCurveModel} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gratitude Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a thank-you note to the giver..."
          />
          <div className="text-xs text-muted-foreground">Saved locally in browser session only.</div>
        </CardContent>
      </Card>
    </div>
  );
}