
import {
    Car, CarFront, CalendarCheck, IndianRupee, Clock, Users,
    LayoutDashboard
} from "lucide-react";
import { StatCard } from "@/components/charts/stat-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { UtilizationChart } from "@/components/charts/utilization-chart";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/tables/status-badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    getDashboardStats, getBookings, getVehicles, getCustomers,
    getMonthlyRevenue, getVehicleUtilization
} from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function OverviewPage() {
    const currentTime = Date.now();

    const [stats, bookings, vehicles, customers, monthlyRevenue, vehicleUtilization] = await Promise.all([
        getDashboardStats(),
        getBookings(),
        getVehicles(),
        getCustomers(),
        getMonthlyRevenue(),
        getVehicleUtilization(),
    ]);

    const vehicleMap = new Map<string, any>(vehicles.map((v: any) => [v.id, v]));
    const customerMap = new Map<string, any>(customers.map((c: any) => [c.id, c]));

    const recentBookings = bookings
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    const upcomingReturns = bookings
        .filter((b: any) => b.status === "Active")
        .sort((a: any, b: any) => new Date(a.dropDate).getTime() - new Date(b.dropDate).getTime())
        .slice(0, 4);

    return (
        <div>
            <PageHeader
                title="Dashboard"
                description="Welcome back! Here's an overview of your fleet operations."
                icon={LayoutDashboard}
            />

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
                <StatCard
                    title="Total Vehicles"
                    value={stats.totalVehicles}
                    icon={Car}
                    trend={{ value: 8, positive: true }}
                    description="vs last month"
                />
                <StatCard
                    title="Available"
                    value={stats.availableVehicles}
                    icon={CarFront}
                    description="ready to rent"
                />
                <StatCard
                    title="Active Rentals"
                    value={stats.activeRentals}
                    icon={CalendarCheck}
                    trend={{ value: 12, positive: true }}
                    description="vs last month"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={formatCurrency(stats.monthlyRevenue)}
                    icon={IndianRupee}
                    trend={{ value: 8, positive: true }}
                    description="vs last month"
                />
                <StatCard
                    title="Pending Payments"
                    value={stats.pendingPayments}
                    icon={Clock}
                    description="require follow-up"
                />
                <StatCard
                    title="Total Customers"
                    value={stats.totalCustomers}
                    icon={Users}
                    trend={{ value: 15, positive: true }}
                    description="vs last month"
                />
            </div>

            {/* Charts */}
            <div className="grid gap-4 lg:grid-cols-2 mb-6">
                <RevenueChart data={monthlyRevenue} />
                <UtilizationChart data={vehicleUtilization} />
            </div>

            {/* Tables */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Recent Bookings */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBookings.map((booking: any) => {
                                    const customer = customerMap.get(booking.customerId);
                                    const vehicle = vehicleMap.get(booking.vehicleId);
                                    return (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">
                                                {booking.id.toUpperCase()}
                                            </TableCell>
                                            <TableCell>{customer?.name || "—"}</TableCell>
                                            <TableCell>
                                                {vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={booking.status} variant="booking" />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(booking.totalAmount)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Upcoming Returns */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Upcoming Returns</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {upcomingReturns.map((booking: any) => {
                            const customer = customerMap.get(booking.customerId);
                            const vehicle = vehicleMap.get(booking.vehicleId);
                            const daysLeft = Math.ceil(
                                (new Date(booking.dropDate).getTime() - currentTime) / (1000 * 60 * 60 * 24)
                            );
                            return (
                                <div
                                    key={booking.id}
                                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {customer?.name} • Due: {new Date(booking.dropDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={
                                            daysLeft <= 1
                                                ? "bg-red-500/10 text-red-600 border-red-500/20"
                                                : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                        }
                                    >
                                        {daysLeft <= 0 ? "Overdue" : `${daysLeft}d left`}
                                    </Badge>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
