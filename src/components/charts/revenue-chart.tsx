"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueChartProps {
    data: any[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <Card className="bg-white border-[#E8E5F0] shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold text-[#1a1d2e]">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
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
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #E8E5F0",
                                borderRadius: "12px",
                                fontSize: "12px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.06)",
                            }}
                            formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                        />
                        <Bar
                            dataKey="revenue"
                            fill="#7C3AED"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={48}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
