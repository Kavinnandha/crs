"use client";

import { useState, useMemo } from "react";
import {
    CreditCard, Search, IndianRupee, Clock, CheckCircle2,
    FileText, Plus, Pencil, Trash2, MoreHorizontal,
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
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Payment, Booking, Customer, Vehicle, PaymentMode, PaymentStatus } from "@/types";

interface PaymentsClientProps {
    initialPayments: Payment[];
    bookings: Booking[];
    customers: Customer[];
    vehicles: Vehicle[];
}

export default function PaymentsClient({ initialPayments, bookings, customers, vehicles }: PaymentsClientProps) {
    const [paymentsList, setPaymentsList] = useState<Payment[]>(initialPayments);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [modeFilter, setModeFilter] = useState("all");
    const [invoiceOpen, setInvoiceOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [formData, setFormData] = useState<Partial<Payment>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const bookingMap = useMemo(() => new Map(bookings.map(b => [b.id, b])), [bookings]);
    const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);
    const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);

    const totalRevenue = paymentsList.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
    const pendingAmount = paymentsList
        .filter((p) => p.status === "Pending" || p.status === "Partial")
        .reduce((s, p) => {
            const booking = bookingMap.get(p.bookingId);
            return s + ((booking?.totalAmount || 0) - p.amount);
        }, 0);
    const paidCount = paymentsList.filter((p) => p.status === "Paid").length;

    const filteredPayments = useMemo(() => {
        let result = [...paymentsList];
        if (search) {
            const q = search.toLowerCase();
            result = result.filter((p) => {
                const b = bookingMap.get(p.bookingId);
                const c = b ? customerMap.get(b.customerId) : undefined;
                return (
                    (p.transactionId && p.transactionId.toLowerCase().includes(q)) ||
                    p.bookingId.toLowerCase().includes(q) ||
                    (c && c.name.toLowerCase().includes(q))
                );
            });
        }
        if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
        if (modeFilter !== "all") result = result.filter((p) => p.mode === modeFilter);
        return result;
    }, [search, statusFilter, modeFilter, paymentsList, bookingMap, customerMap]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.bookingId) errors.bookingId = "Booking is required";
        if (!formData.amount || formData.amount <= 0) errors.amount = "Valid amount is required";
        if (!formData.mode) errors.mode = "Payment mode is required";
        if (!formData.status) errors.status = "Status is required";

        // Transaction ID required if paid
        if ((formData.status === "Paid" || formData.status === "Partial") && !formData.transactionId?.trim()) {
            errors.transactionId = "Transaction ID is required for paid payments";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openAddForm = () => {
        setSelectedPayment(null);
        setFormData({
            status: "Pending",
            mode: "Cash",
            paidAt: new Date().toISOString()
        });
        setFormErrors({});
        setFormOpen(true);
    };

    const openEditForm = (payment: Payment) => {
        setSelectedPayment(payment);
        setFormData({ ...payment });
        setFormErrors({});
        setFormOpen(true);
    };

    const handleSave = () => {
        if (!validateForm()) return;

        if (selectedPayment) {
            setPaymentsList(prev => prev.map(p => p.id === selectedPayment.id ? { ...p, ...formData } as Payment : p));
        } else {
            const newPayment: Payment = {
                id: `p${Date.now()}`,
                bookingId: formData.bookingId!,
                amount: formData.amount!,
                mode: formData.mode as PaymentMode,
                status: formData.status as PaymentStatus,
                paidAt: formData.paidAt || new Date().toISOString(),
                transactionId: formData.transactionId || `TXN${Date.now()}`,
            };
            setPaymentsList(prev => [newPayment, ...prev]);
        }
        setFormOpen(false);
    };

    const handleDelete = () => {
        if (selectedPayment) {
            setPaymentsList(prev => prev.filter(p => p.id !== selectedPayment.id));
        }
        setDeleteOpen(false);
        setSelectedPayment(null);
    };

    return (
        <div>
            <PageHeader title="Payments" description="Track all payment transactions and invoices" icon={CreditCard}>
                <Button onClick={openAddForm}>
                    <Plus className="mr-2 h-4 w-4" /> Add Payment
                </Button>
            </PageHeader>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <StatCard title="Total Collected" value={formatCurrency(totalRevenue)} icon={IndianRupee} trend={{ value: 12, positive: true }} description="vs last month" />
                <StatCard title="Pending Amount" value={formatCurrency(pendingAmount)} icon={Clock} description="awaiting collection" />
                <StatCard title="Completed Payments" value={paidCount} icon={CheckCircle2} description={`of ${paymentsList.length} total`} />
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

            <Card>
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
                                <TableHead className="w-[80px]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No payments found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredPayments.map((payment) => {
                                    const booking = bookingMap.get(payment.bookingId);
                                    const customer = booking ? customerMap.get(booking.customerId) : undefined;
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
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => { setSelectedPayment(payment); setInvoiceOpen(true); }}>
                                                            <FileText className="mr-2 h-4 w-4" /> View Invoice
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openEditForm(payment)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => { setSelectedPayment(payment); setDeleteOpen(true); }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedPayment ? "Edit Payment" : "Add New Payment"}</DialogTitle>
                        <DialogDescription>
                            {selectedPayment ? "Update payment details." : "Record a new payment transaction."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="booking">Booking *</Label>
                            <Select
                                value={formData.bookingId || ""}
                                onValueChange={(v) => {
                                    const b = bookingMap.get(v);
                                    setFormData({
                                        ...formData,
                                        bookingId: v,
                                        amount: b ? b.totalAmount : formData.amount
                                    });
                                }}
                                disabled={!!selectedPayment}
                            >
                                <SelectTrigger><SelectValue placeholder="Select Booking" /></SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {bookings.map(b => {
                                        const c = customerMap.get(b.customerId);
                                        return (
                                            <SelectItem key={b.id} value={b.id}>
                                                {b.id.toUpperCase()} - {c?.name || "Unknown"} ({formatCurrency(b.totalAmount)})
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            {formErrors.bookingId && <p className="text-xs text-destructive">{formErrors.bookingId}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="amount">Amount *</Label>
                                <Input id="amount" type="number" value={formData.amount || ""} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                                {formErrors.amount && <p className="text-xs text-destructive">{formErrors.amount}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Mode *</Label>
                                <Select value={formData.mode || "Cash"} onValueChange={(v) => setFormData({ ...formData, mode: v as PaymentMode })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="Card">Card</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formErrors.mode && <p className="text-xs text-destructive">{formErrors.mode}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="txnId">Transaction ID</Label>
                            <Input id="txnId" value={formData.transactionId || ""} onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })} placeholder="Optional for pending" />
                            {formErrors.transactionId && <p className="text-xs text-destructive">{formErrors.transactionId}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Status *</Label>
                            <Select value={formData.status || "Pending"} onValueChange={(v) => setFormData({ ...formData, status: v as PaymentStatus })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Partial">Partial</SelectItem>
                                </SelectContent>
                            </Select>
                            {formErrors.status && <p className="text-xs text-destructive">{formErrors.status}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Payment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete payment {selectedPayment?.transactionId}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Invoice Dialog */}
            <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Invoice</DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (() => {
                        const booking = bookingMap.get(selectedPayment.bookingId);
                        const customer = booking ? customerMap.get(booking.customerId) : undefined;
                        const vehicle = booking ? vehicleMap.get(booking.vehicleId) : undefined;
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
                                        <p className="font-medium">INV-{selectedPayment.transactionId ? selectedPayment.transactionId.slice(-6) : "PENDING"}</p>
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
