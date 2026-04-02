"use client";

import React from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { toCompactDate, toCurrency } from "@/lib/api/serializers";

type PricePoint = {
  capturedAt: string;
  marketPrice: number;
};

export function PriceHistoryChart({ points }: { points: PricePoint[] }) {
  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={points}>
          <XAxis dataKey="capturedAt" tickFormatter={toCompactDate} />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip
            formatter={(value: number) => toCurrency(value)}
            labelFormatter={(value: string) => new Date(value).toLocaleString()}
          />
          <Line
            type="monotone"
            dataKey="marketPrice"
            stroke="#9d2a1d"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
