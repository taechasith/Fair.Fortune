"use client";

import { useMemo } from "react";
import { AgeCurveChart } from "@/components/age-curve-chart";
import { ImportJson } from "@/components/import-json";
import { RecipientTable } from "@/components/recipient-table";
import { ResultsPanel } from "@/components/results-panel";
import { SettingsPanel } from "@/components/settings-panel";
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

  const canRun = useMemo(() => recipients.length > 0 && settings.budget >= 0, [recipients, settings.budget]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#7A0C1B]">Giver Mode</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="cny-panel">
          <CardHeader>
            <CardTitle>Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <RecipientTable recipients={recipients} onChange={setRecipients} />
          </CardContent>
        </Card>
        <Card className="cny-panel">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsPanel settings={settings} onChange={setSettings} />
          </CardContent>
        </Card>
      </div>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Age Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <AgeCurveChart anchors={settings.anchorPoints} model={settings.solverSettings.ageCurveModel} />
        </CardContent>
      </Card>

      <div className="cny-divider" />

      <div className="flex flex-wrap gap-2">
        <Button
          className="cny-shimmer"
          onClick={() => {
            if (!canRun) return;
            setLastResult(computeAllocation(recipients, settings));
          }}
        >
          Run Allocation
        </Button>
        <Button variant="secondary" onClick={() => exportState(persisted)}>
          Export JSON
        </Button>
        <ImportJson onImport={setAll} />
      </div>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="cny-parchment rounded-xl p-4">
          <ResultsPanel result={lastResult} budget={settings.budget} />
        </CardContent>
      </Card>
    </div>
  );
}
