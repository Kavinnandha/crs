"use client";

import { useMemo } from "react";
import {
    BarChart3, TrendingUp, CalendarDays,
    IndianRupee, CreditCard, PieChart as PieChartIcon, ArrowRight
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Vehicle, Booking, Payment } from "@/types";

interface ReportsClientProps {
    vehicles: Vehicle[];
    bookings: Booking[];
    payments: Payment[];
}

const COLORS = [
    "#7C3AED", // Violet-600 (Primary)
    "#A78BFA", // Violet-400
    "#C4B5FD", // Violet-300
    "#DDD6FE", // Violet-200
    "#EDE9FE", // Violet-100
];

export default function ReportsClient({ vehicles, bookings, payments }: ReportsClientProps) {
    // 1. Calculate Monthly Revenue
    const monthlyRevenue = useMemo(() => {
        const revenueMap: Record<string, number> = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Initialize last 6 months
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            revenueMap[monthNames[d.getMonth()]] = 0;
        }

        payments.forEach((p) => {
            if (p.status === "Paid" && p.paidAt) {
                const date = new Date(p.paidAt);
                const month = monthNames[date.getMonth()];
                if (revenueMap[month] !== undefined) {
                    revenueMap[month] += p.amount;
                }
            }
        });

        return Object.entries(revenueMap).map(([month, revenue]) => ({ month, revenue }));
    }, [payments]);

    // 2. Calculate Top Vehicles
    const topVehicles = useMemo(() => {
        const stats = vehicles.map(v => {
            const vehicleBookings = bookings.filter(b => b.vehicleId === v.id && b.status !== "Cancelled");
            const revenue = vehicleBookings.reduce((sum, b) => sum + b.totalAmount, 0);
            return {
                ...v,
                bookingCount: vehicleBookings.length,
                revenue
            };
        });
        return stats.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [vehicles, bookings]);

    // 3. Category Distribution
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        bookings.forEach(b => {
            const v = vehicles.find(veh => veh.id === b.vehicleId);
            if (v && b.status !== "Cancelled") {
                counts[v.category] = (counts[v.category] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [bookings, vehicles]);

    // 4. Idle Vehicles
    const idleVehicles = useMemo(() => {
        const activeVehicleIds = new Set(
            bookings
                .filter(b => b.status === "Active" || b.status === "Reserved")
                .map(b => b.vehicleId)
        );
        return vehicles.filter(v => !activeVehicleIds.has(v.id)).slice(0, 5);
    }, [vehicles, bookings]);

    const totalRevenue = payments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
    const pendingRevenue = payments.filter(p => p.status === "Pending").reduce((sum, p) => sum + p.amount, 0);
    const utilizationRate = Math.round((bookings.filter(b => b.status === "Active").length / vehicles.length) * 100) || 0;


    return (
        <div className="space-y-6">
            <PageHeader
                title="Reports & Analytics"
                description="Insights and performance metrics for your fleet"
                breadcrumb={["Dashboard", "Reports"]}
            />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-sm bg-linear-to-br from-white to-violet-50/50 dark:from-slate-900 dark:to-violet-950/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-violet-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-violet-950 dark:text-violet-200">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
                        <CreditCard className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(pendingRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">12 invoices pending</p>
                    </CardContent>
                </Card>
                <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Utilization Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{utilizationRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Currently active rentals</p>
                    </CardContent>
                </Card>
                <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{bookings.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Revenue Chart */}
                <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BarChart3 className="h-4 w-4" /> Revenue Trend
                        </CardTitle>
                        <CardDescription>Monthly revenue breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="w-full min-w-0">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:[&>line]:stroke-slate-700" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border, #E2E8F0)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                                        wrapperClassName="!bg-white dark:!bg-slate-800 [&_.recharts-tooltip-label]:!text-foreground"
                                        formatter={(value: number | undefined) => [formatCurrency(value || 0), "Revenue"]}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Pie Chart */}
                <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <PieChartIcon className="h-4 w-4" /> Bookings by Category
                        </CardTitle>
                        <CardDescription>Popular vehicle segments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full min-w-0">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border, #E2E8F0)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                                        wrapperClassName="!bg-white dark:!bg-slate-800"
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tables Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Performing Vehicles */}
                <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold">Top Performers</CardTitle>
                            <CardDescription>Highest revenue generating vehicles</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                            <Link href="/dashboard/vehicles">View All <ArrowRight className="ml-1 h-3 w-3" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-transparent">
                                    <TableHead className="w-[50px] font-medium text-xs text-muted-foreground">#</TableHead>
                                    <TableHead className="font-medium text-xs text-muted-foreground">Vehicle</TableHead>
                                    <TableHead className="text-right font-medium text-xs text-muted-foreground">Trips</TableHead>
                                    <TableHead className="text-right font-medium text-xs text-muted-foreground">Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topVehicles.map((v, i) => (
                                    <TableRow key={v.id} className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <TableCell className="font-mono text-xs text-muted-foreground pl-4">{i + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm text-slate-700 dark:text-slate-200">{v.brand} {v.model}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{v.registrationNumber}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="secondary" className="bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-950/50">{v.bookingCount}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-700 dark:text-slate-200 pr-4">{formatCurrency(v.revenue)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Idle Vehicles */}
                <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                Available Now <Badge variant="outline" className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">{idleVehicles.length}</Badge>
                            </CardTitle>
                            <CardDescription>Vehicles ready for booking</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 grid gap-3">
                        {idleVehicles.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">No vehicles currently available.</div>
                        ) : (
                            idleVehicles.map((v) => (
                                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-200 dark:hover:border-violet-800 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-violet-50 dark:group-hover:bg-violet-950/30 group-hover:text-violet-600 transition-colors">
                                            <Car className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-slate-700 dark:text-slate-200">{v.brand} {v.model}</p>
                                            <p className="text-xs text-muted-foreground">{v.category} • {v.fuelType}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm text-slate-900 dark:text-white">{formatCurrency(v.pricePerDay)}<span className="text-xs text-muted-foreground font-normal">/day</span></p>
                                        <Link href="/dashboard/bookings/new" className="text-xs text-violet-600 font-medium hover:underline">Book Now</Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Car(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
        </svg>
    )
}
