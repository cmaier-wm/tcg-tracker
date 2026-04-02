"use client";

import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { toCompactDate, toCurrency } from "@/lib/api/serializers";

type PortfolioPoint = {
  capturedAt: string;
  totalValue: number;
};

export function PortfolioValueChart({ points }: { points: PortfolioPoint[] }) {
  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={points}>
          <XAxis dataKey="capturedAt" tickFormatter={toCompactDate} />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip
            formatter={(value: number) => toCurrency(value)}
            labelFormatter={(value: string) => new Date(value).toLocaleString()}
          />
          <Area
            type="monotone"
            dataKey="totalValue"
            stroke="#9d2a1d"
            fill="#f7ddd5"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
