"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UtilizationChartProps {
    data: any[];
}

export function UtilizationChart({ data }: UtilizationChartProps) {
    return (
        <Card className="bg-white border-[#E8E5F0] shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold text-[#1a1d2e]">Vehicle Utilization</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E5F0" />
                        <XAxis
                            type="number"
                            domain={[0, 100]}
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                            tickFormatter={(v) => `${v}%`}
                        />
                        <YAxis
                            dataKey="category"
                            type="category"
                            width={80}
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #E8E5F0",
                                borderRadius: "12px",
                                fontSize: "12px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.06)",
                            }}
                            formatter={(value, name) => [
                                `${value}%`,
                                name === "utilized" ? "Utilized" : "Idle",
                            ]}
                        />
                        <Legend />
                        <Bar dataKey="utilized" stackId="a" fill="#7C3AED" radius={[0, 0, 0, 0]} name="Utilized" />
                        <Bar dataKey="idle" stackId="a" fill="#E8E5F0" radius={[0, 6, 6, 0]} name="Idle" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
