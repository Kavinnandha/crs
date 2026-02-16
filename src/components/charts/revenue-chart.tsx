"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="bg-white dark:bg-slate-900 border-[#E8E5F0] dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-[#1a1d2e] dark:text-white">
          Monthly Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full min-w-0">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E5F0" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #E8E5F0",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.06)",
                }}
                wrapperClassName="!bg-white dark:!bg-slate-800"
                formatter={(value) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  "Revenue",
                ]}
              />
              <Bar
                dataKey="revenue"
                fill="#7C3AED"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
