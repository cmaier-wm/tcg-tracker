"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="capturedAt" tickFormatter={toCompactDate} />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip
            formatter={(value: number) => toCurrency(value)}
            labelFormatter={(value: string) => new Date(value).toLocaleString()}
          />
          <Area
            type="monotone"
            dataKey="totalValue"
            stroke="#2563eb"
            fill="#dbeafe"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
