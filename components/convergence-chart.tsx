"use client";

import { IterationPoint } from "@/lib/types";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function ConvergenceChart({
  jacobi,
  gaussSeidel
}: {
  jacobi: IterationPoint[];
  gaussSeidel: IterationPoint[];
}) {
  const len = Math.max(jacobi.length, gaussSeidel.length);
  const rows = Array.from({ length: len }, (_, i) => ({
    iteration: i + 1,
    jacobi: jacobi[i]?.linfResidual,
    gaussSeidel: gaussSeidel[i]?.linfResidual
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="4 4" stroke="#D4AF37" opacity={0.35} />
          <XAxis dataKey="iteration" stroke="#7A0C1B" />
          <YAxis stroke="#7A0C1B" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="jacobi" stroke="#C8102E" strokeWidth={2.2} dot={false} />
          <Line type="monotone" dataKey="gaussSeidel" stroke="#D4AF37" strokeWidth={2.2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
