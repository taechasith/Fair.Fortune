"use client";

import { useMemo } from "react";
import { AnchorPoint } from "@/lib/types";
import { buildAgeCurve } from "@/lib/math/ageCurve";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function AgeCurveChart({
  anchors,
  model
}: {
  anchors: AnchorPoint[];
  model: "linear" | "spline";
}) {
  const data = useMemo(() => {
    const curve = buildAgeCurve(model, anchors);
    return Array.from({ length: 81 }, (_, age) => ({ age, weight: curve.ageWeight(age) }));
  }, [anchors, model]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}