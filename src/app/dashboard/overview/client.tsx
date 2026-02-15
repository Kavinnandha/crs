"use client";

import { useMemo, useState, useEffect } from "react";
import {
    IndianRupee, Users, CalendarCheck, Car, Key, ArrowUpRight, TrendingUp
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/tables/status-badge";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Vehicle, Booking, Payment, Customer } from "@/types";

interface OverviewClientProps {
    vehicles: Vehicle[];
    bookings: Booking[];
    payments: Payment[];
    customers: Customer[];
}

export default function OverviewClient({ vehicles, bookings, payments, customers }: OverviewClientProps) {
    // KPI Calculations
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === "Available").length;
    const activeRentals = bookings.filter(b => b.status === "Active").length;
    const totalRevenue = payments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
    const totalCustomers = customers.length;

    // Monthly Revenue Data for Chart
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


    // Recent Bookings
    const recentBookings = [...bookings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNow(Date.now());
    }, []);

    // Upcoming Returns
    const upcomingReturns = bookings
        .filter(b => b.status === "Active")
        .sort((a, b) => new Date(a.dropDate).getTime() - new Date(b.dropDate).getTime())
        .slice(0, 4);

    const customerMap = new Map(customers.map(c => [c.id, c]));
    const vehicleMap = new Map(vehicles.map(v => [v.id, v]));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="Dashboard Overview"
                description="Welcome back! Here's what's happening today."
                breadcrumb={["Dashboard", "Overview"]}
            />

            {/* KPI Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <KPICard
                    title="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    icon={IndianRupee}
                    trend="+12%"
                    trendUp={true}
                    color="text-violet-600"
                    bg="bg-violet-50"
                />
                <KPICard
                    title="Active Rentals"
                    value={activeRentals}
                    icon={Key}
                    trend="Now"
                    trendUp={true}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <KPICard
                    title="Available Cars"
                    value={availableVehicles}
                    icon={Car}
                    trend={`${Math.round((availableVehicles / totalVehicles) * 100)}%`}
                    description="of fleet available"
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <KPICard
                    title="Total Customers"
                    value={totalCustomers}
                    icon={Users}
                    trend="+5"
                    trendUp={true}
                    color="text-pink-600"
                    bg="bg-pink-50"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2 border-[#E8E5F0] dark:border-slate-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <TrendingUp className="h-4 w-4 text-violet-600" /> Revenue Trend
                        </CardTitle>
                        <CardDescription>Monthly revenue breakdown over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="w-full min-w-0">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenueOverview" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                                        formatter={(value: number | undefined) => [formatCurrency(value || 0), "Revenue"]}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenueOverview)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Returns */}
                <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-sm flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <CalendarCheck className="h-4 w-4 text-blue-600" /> Upcoming Returns
                        </CardTitle>
                        <CardDescription>Vehicles due for return soon</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-4">
                            {upcomingReturns.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No upcoming returns.</p>
                            ) : (
                                upcomingReturns.map((booking) => {
                                    const vehicle = vehicleMap.get(booking.vehicleId);
                                    const customer = customerMap.get(booking.customerId);
                                    // Use 0 or now if null to avoid NaN, though initially loading state might be better
                                    const daysLeft = now ? Math.ceil((new Date(booking.dropDate).getTime() - now) / (1000 * 60 * 60 * 24)) : 0;

                                    return (
                                        <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                                    <Car className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{vehicle?.brand} {vehicle?.model}</p>
                                                    <p className="text-xs text-muted-foreground">{customer?.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={daysLeft <= 0 ? "destructive" : "secondary"} className={daysLeft <= 0 ? "" : "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-950/60"}>
                                                    {daysLeft <= 0 ? "Overdue" : `${daysLeft}d left`}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                    <div className="p-4 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <Button variant="ghost" className="w-full text-xs h-8 text-muted-foreground hover:text-foreground" asChild>
                            <Link href="/dashboard/bookings">View all bookings</Link>
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Recent Bookings Table */}
            <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                        <CardDescription>Latest bookings and rentals</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/bookings" className="gap-2">
                            View All <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                                <TableHead className="w-[100px] text-xs font-semibold">ID</TableHead>
                                <TableHead className="text-xs font-semibold">Customer</TableHead>
                                <TableHead className="text-xs font-semibold">Vehicle</TableHead>
                                <TableHead className="text-xs font-semibold">Status</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentBookings.map((booking) => {
                                const customer = customerMap.get(booking.customerId);
                                const vehicle = vehicleMap.get(booking.vehicleId);
                                return (
                                    <TableRow key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {booking.id.slice(-6).toUpperCase()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center text-[10px] font-bold">
                                                    {customer?.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{customer?.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600 dark:text-slate-400">{vehicle?.brand} {vehicle?.model}</TableCell>
                                        <TableCell><StatusBadge status={booking.status} variant="booking" /></TableCell>
                                        <TableCell className="text-right font-medium text-slate-700 dark:text-slate-300">{formatCurrency(booking.totalAmount)}</TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {new Date(booking.createdAt).toLocaleDateString("en-IN", { month: 'short', day: 'numeric' })}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

interface KPICardProps {
    title: string;
    value: string | number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any; // Lucide icon type is generic
    trend: string;
    trendUp?: boolean;
    description?: string;
    color: string;
    bg: string;
}

function KPICard({ title, value, icon: Icon, trend, trendUp, description, color, bg }: KPICardProps) {
    return (
        <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-xl ${bg} dark:bg-opacity-20`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    {trend && (
                        <Badge variant="outline" className={`${trendUp ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'}`}>
                            {trend}
                        </Badge>
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
                    {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
