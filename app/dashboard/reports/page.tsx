"use client";

import { BarChart3, Car, TrendingUp, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from "recharts";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    monthlyRevenue, vehicleUtilization, vehicles, bookings, formatCurrency,
} from "@/lib/mock-data";

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export default function ReportsPage() {
    // Calculate most rented vehicles
    const vehicleBookingCount = vehicles.map((v) => {
        const count = bookings.filter(
            (b) => b.vehicleId === v.id && b.status !== "Cancelled"
        ).length;
        const revenue = bookings
            .filter((b) => b.vehicleId === v.id && b.status !== "Cancelled")
            .reduce((s, b) => s + b.totalAmount, 0);
        return { ...v, bookingCount: count, revenue };
    });

    const topVehicles = [...vehicleBookingCount]
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 5);

    const idleVehicles = vehicleBookingCount.filter((v) => v.bookingCount === 0);

    const categoryData = ["Hatchback", "Sedan", "SUV", "Luxury"].map((cat) => ({
        name: cat,
        value: bookings.filter((b) => {
            const v = vehicles.find((veh) => veh.id === b.vehicleId);
            return v?.category === cat && b.status !== "Cancelled";
        }).length,
    }));

    return (
        <div>
            <PageHeader
                title="Reports & Analytics"
                description="Insights and performance metrics for your fleet"
                icon={BarChart3}
            />

            {/* Revenue Chart */}
            <div className="grid gap-4 lg:grid-cols-2 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> Monthly Revenue Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                                    formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                                />
                                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Bookings by Category Pie */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Car className="h-4 w-4" /> Bookings by Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {categoryData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Vehicle Utilization */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Vehicle Utilization by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={vehicleUtilization} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                            <YAxis dataKey="category" type="category" width={80} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                                formatter={(value, name) => [`${value}%`, name === "utilized" ? "Utilized" : "Idle"]}
                            />
                            <Legend />
                            <Bar dataKey="utilized" stackId="a" fill="hsl(var(--chart-2))" name="Utilized" />
                            <Bar dataKey="idle" stackId="a" fill="hsl(var(--chart-5))" radius={[0, 6, 6, 0]} name="Idle" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Tables */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Most Rented */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> Most Rented Vehicles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Bookings</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topVehicles.map((v, i) => (
                                    <TableRow key={v.id}>
                                        <TableCell className="font-medium">{i + 1}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium">{v.brand} {v.model}</p>
                                                <p className="text-xs text-muted-foreground">{v.category}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{v.bookingCount}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(v.revenue)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Idle Vehicles */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" /> Idle Vehicles
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {idleVehicles.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">All vehicles have been booked at least once.</p>
                        ) : (
                            <div className="space-y-3">
                                {idleVehicles.map((v) => (
                                    <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div>
                                            <p className="text-sm font-medium">{v.brand} {v.model}</p>
                                            <p className="text-xs text-muted-foreground">{v.registrationNumber} • {v.category}</p>
                                        </div>
                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                            No bookings
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
