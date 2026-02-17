"use client";

import { useMemo, useState } from "react";
import { ImportJson } from "@/components/import-json";
import { RecipientTable } from "@/components/recipient-table";
import { ResultsPanel } from "@/components/results-panel";
import { SettingsPanel, SpendingStyle } from "@/components/settings-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeAllocation } from "@/lib/math/engine";
import { exportState } from "@/lib/state/storage";
import { useScenarioState } from "@/lib/state/useScenarioState";

export default function GiverPage() {
  const {
    recipients,
    settings,
    setRecipients,
    setSettings,
    lastResult,
    setLastResult,
    setAll,
    persisted
  } = useScenarioState();
  const [spendingStyle, setSpendingStyle] = useState<SpendingStyle>("auto");

  const canRun = useMemo(() => recipients.length > 0 && settings.budget >= 0, [recipients, settings.budget]);

  function applySpendingStyle() {
    if (spendingStyle === "balanced") {
      return recipients.map((r) => ({ ...r, roleFactor: 1 }));
    }
    if (spendingStyle === "younger") {
      return recipients.map((r) => ({
        ...r,
        roleFactor: r.age <= 18 ? 1.18 : r.age >= 55 ? 0.92 : 1
      }));
    }
    return recipients.map((r) => ({
      ...r,
      roleFactor: r.age <= 12 ? 1.2 : r.age <= 22 ? 1.08 : r.age >= 60 ? 1.1 : 1
    }));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#7A0C1B]">Giver Mode</h1>
      <Card className="cny-panel">
        <CardContent className="pt-6">
          <ol className="grid gap-2 text-sm text-[#5f5148] md:grid-cols-5">
            <li>Step 1: Enter Budget</li>
            <li>Step 2: Add People</li>
            <li>Step 3: Choose Fairness Style</li>
            <li>Step 4: Click Calculate</li>
            <li>Step 5: See Results</li>
          </ol>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="cny-panel">
          <CardHeader>
            <CardTitle>Who will receive?</CardTitle>
          </CardHeader>
          <CardContent>
            <RecipientTable recipients={recipients} onChange={setRecipients} />
          </CardContent>
        </Card>
        <Card className="cny-panel">
          <CardHeader>
            <CardTitle>How fair should it feel?</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsPanel
              settings={settings}
              onChange={setSettings}
              spendingStyle={spendingStyle}
              onSpendingStyleChange={setSpendingStyle}
            />
          </CardContent>
        </Card>
      </div>

      <div className="cny-divider" />

      <div className="flex flex-wrap gap-2">
        <Button
          className="cny-shimmer"
          onClick={() => {
            if (!canRun) return;
            setLastResult(computeAllocation(applySpendingStyle(), settings));
          }}
        >
          Calculate
        </Button>
        <details className="rounded-xl border border-[#D4AF37]/45 px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-[#7A0C1B]">Advanced Tools</summary>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => exportState(persisted)}>
              Export Data
            </Button>
            <ImportJson onImport={setAll} />
          </div>
        </details>
      </div>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Simple Explanation</CardTitle>
        </CardHeader>
        <CardContent className="cny-parchment rounded-xl p-4">
          <ResultsPanel result={lastResult} budget={settings.budget} />
        </CardContent>
      </Card>
    </div>
  );
}
