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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="jacobi" stroke="#d97706" dot={false} />
          <Line type="monotone" dataKey="gaussSeidel" stroke="#0f766e" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}