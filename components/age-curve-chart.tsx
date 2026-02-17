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
          <CartesianGrid strokeDasharray="4 4" stroke="#D4AF37" opacity={0.35} />
          <XAxis dataKey="age" stroke="#7A0C1B" />
          <YAxis stroke="#7A0C1B" />
          <Tooltip />
          <Line type="monotone" dataKey="weight" stroke="#C8102E" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
