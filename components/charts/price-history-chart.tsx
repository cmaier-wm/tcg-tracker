"use client";

import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { toCompactDate, toCurrency, toFullDateTime } from "@/lib/api/serializers";

type PricePoint = {
  capturedAt: string;
  marketPrice: number;
};

export function PriceHistoryChart({ points }: { points: PricePoint[] }) {
  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={points}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="capturedAt" tickFormatter={toCompactDate} />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip
            formatter={(value: number) => toCurrency(value)}
            labelFormatter={(value: string) => toFullDateTime(value)}
          />
          <Line
            type="monotone"
            dataKey="marketPrice"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
