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
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Vehicle Utilization</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            type="number"
                            domain={[0, 100]}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            tickFormatter={(v) => `${v}%`}
                        />
                        <YAxis
                            dataKey="category"
                            type="category"
                            width={80}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                fontSize: "12px",
                            }}
                            formatter={(value, name) => [
                                `${value}%`,
                                name === "utilized" ? "Utilized" : "Idle",
                            ]}
                        />
                        <Legend />
                        <Bar dataKey="utilized" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 0, 0]} name="Utilized" />
                        <Bar dataKey="idle" stackId="a" fill="hsl(var(--chart-5))" radius={[0, 6, 6, 0]} name="Idle" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
