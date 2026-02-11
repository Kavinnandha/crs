"use client";

import { useState, useMemo } from "react";
import {
    CreditCard, Search, IndianRupee, Clock, CheckCircle2,
    FileText,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/charts/stat-card";
import { StatusBadge } from "@/components/tables/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    payments as allPayments, getBookingById, getCustomerById, getVehicleById, formatCurrency,
} from "@/lib/mock-data";

export default function PaymentsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [modeFilter, setModeFilter] = useState("all");
    const [invoiceOpen, setInvoiceOpen] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

    const totalRevenue = allPayments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
    const pendingAmount = allPayments
        .filter((p) => p.status === "Pending" || p.status === "Partial")
        .reduce((s, p) => {
            const booking = getBookingById(p.bookingId);
            return s + ((booking?.totalAmount || 0) - p.amount);
        }, 0);
    const paidCount = allPayments.filter((p) => p.status === "Paid").length;

    const filteredPayments = useMemo(() => {
        let result = [...allPayments];
        if (search) {
            const q = search.toLowerCase();
            result = result.filter((p) => {
                const b = getBookingById(p.bookingId);
                const c = b ? getCustomerById(b.customerId) : undefined;
                return (
                    p.transactionId.toLowerCase().includes(q) ||
                    p.bookingId.toLowerCase().includes(q) ||
                    c?.name.toLowerCase().includes(q)
                );
            });
        }
        if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
        if (modeFilter !== "all") result = result.filter((p) => p.mode === modeFilter);
        return result;
    }, [search, statusFilter, modeFilter]);

    const selectedPayment = selectedPaymentId
        ? allPayments.find((p) => p.id === selectedPaymentId)
        : null;

    return (
        <div>
            <PageHeader title="Payments" description="Track all payment transactions and invoices" icon={CreditCard} />

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <StatCard title="Total Collected" value={formatCurrency(totalRevenue)} icon={IndianRupee} trend={{ value: 12, positive: true }} description="vs last month" />
                <StatCard title="Pending Amount" value={formatCurrency(pendingAmount)} icon={Clock} description="awaiting collection" />
                <StatCard title="Completed Payments" value={paidCount} icon={CheckCircle2} description={`of ${allPayments.length} total`} />
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search by transaction ID, booking, or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Partial">Partial</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={modeFilter} onValueChange={setModeFilter}>
                            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Mode" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Modes</SelectItem>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="Card">Card</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Desktop Table */}
            <Card className="hidden md:block">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Booking</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Mode</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-[50px]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No payments found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredPayments.map((payment) => {
                                    const booking = getBookingById(payment.bookingId);
                                    const customer = booking ? getCustomerById(booking.customerId) : undefined;
                                    return (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-mono text-xs">{payment.transactionId || "—"}</TableCell>
                                            <TableCell className="font-mono text-xs">{payment.bookingId.toUpperCase()}</TableCell>
                                            <TableCell className="text-sm">{customer?.name || "—"}</TableCell>
                                            <TableCell className="text-sm">{payment.mode}</TableCell>
                                            <TableCell><StatusBadge status={payment.status} variant="payment" /></TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedPaymentId(payment.id); setInvoiceOpen(true); }}>
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filteredPayments.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            No payments found.
                        </CardContent>
                    </Card>
                ) : (
                    filteredPayments.map((payment) => {
                        const booking = getBookingById(payment.bookingId);
                        const customer = booking ? getCustomerById(booking.customerId) : undefined;
                        return (
                            <Card key={payment.id}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <p className="font-mono text-xs text-muted-foreground mb-1">
                                                {payment.transactionId || "—"}
                                            </p>
                                            <p className="font-medium text-sm">{customer?.name || "—"}</p>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                {payment.bookingId.toUpperCase()}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedPaymentId(payment.id); setInvoiceOpen(true); }}>
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                        <div>
                                            <p className="text-muted-foreground">Mode</p>
                                            <p className="font-medium">{payment.mode}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Date</p>
                                            <p className="font-medium">
                                                {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <StatusBadge status={payment.status} variant="payment" />
                                        <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Invoice Dialog */}
            <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Invoice</DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (() => {
                        const booking = getBookingById(selectedPayment.bookingId);
                        const customer = booking ? getCustomerById(booking.customerId) : undefined;
                        const vehicle = booking ? getVehicleById(booking.vehicleId) : undefined;
                        const days = booking ? Math.ceil((new Date(booking.dropDate).getTime() - new Date(booking.pickupDate).getTime()) / 86400000) : 0;
                        const subtotal = booking?.totalAmount || 0;
                        const gst = Math.round(subtotal * 0.18);
                        return (
                            <div className="space-y-4">
                                <div className="text-center border-b pb-4">
                                    <h3 className="text-lg font-bold">SpeedWheels Car Rentals</h3>
                                    <p className="text-xs text-muted-foreground">42, 100 Feet Road, Indiranagar, Bangalore</p>
                                    <p className="text-xs text-muted-foreground">GSTIN: 29AABCS1429B1ZB</p>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Invoice #</p>
                                        <p className="font-medium">INV-{selectedPayment.transactionId.slice(-6) || "000000"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Date</p>
                                        <p className="font-medium">{selectedPayment.paidAt ? new Date(selectedPayment.paidAt).toLocaleDateString("en-IN") : "Pending"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Customer</p>
                                        <p className="font-medium">{customer?.name || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Vehicle</p>
                                        <p className="font-medium">{vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Rental ({days} days × {formatCurrency(vehicle?.pricePerDay || 0)})</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">GST (18%)</span>
                                        <span>{formatCurrency(gst)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-base">
                                        <span>Total</span>
                                        <span>{formatCurrency(subtotal + gst)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Paid</span>
                                        <span>{formatCurrency(selectedPayment.amount)}</span>
                                    </div>
                                    {(subtotal + gst - selectedPayment.amount > 0) && (
                                        <div className="flex justify-between text-destructive font-medium">
                                            <span>Balance Due</span>
                                            <span>{formatCurrency(subtotal + gst - selectedPayment.amount)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center pt-2">
                                    <p className="text-xs text-muted-foreground">Payment Mode: {selectedPayment.mode}</p>
                                    <StatusBadge status={selectedPayment.status} variant="payment" />
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
