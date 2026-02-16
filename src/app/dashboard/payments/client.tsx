"use client";

import { useState, useMemo, useEffect } from "react";
import {
  IndianRupee,
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useDashboard } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/charts/stat-card";
import { StatusBadge } from "@/components/tables/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Payment, Booking, Customer, Vehicle } from "@/types";
import Link from "next/link";
import { deletePayment } from "@/lib/actions";

interface PaymentsClientProps {
  initialPayments: Payment[];
  bookings: Booking[];
  customers: Customer[];
  vehicles: Vehicle[];
}

export default function PaymentsClient({
  initialPayments,
  bookings,
  customers,
  vehicles,
}: PaymentsClientProps) {
  const { setHeaderAction, searchTerm } = useDashboard();
  const [paymentsList, setPaymentsList] = useState<Payment[]>(initialPayments);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    setPaymentsList(initialPayments);
  }, [initialPayments]);

  const bookingMap = useMemo(
    () => new Map(bookings.map((b) => [b.id, b])),
    [bookings],
  );
  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers],
  );
  const vehicleMap = useMemo(
    () => new Map(vehicles.map((v) => [v.id, v])),
    [vehicles],
  );

  const totalRevenue = paymentsList
    .filter((p) => p.status === "Paid")
    .reduce((s, p) => s + p.amount, 0);
  const pendingAmount = paymentsList
    .filter((p) => p.status === "Pending" || p.status === "Partial")
    .reduce((s, p) => {
      const booking = bookingMap.get(p.bookingId);
      return s + ((booking?.totalAmount || 0) - p.amount);
    }, 0);
  const paidCount = paymentsList.filter((p) => p.status === "Paid").length;

  const filteredPayments = useMemo(() => {
    let result = [...paymentsList];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((p) => {
        const booking = bookingMap.get(p.bookingId);
        const customer = booking
          ? customerMap.get(booking.customerId)
          : undefined;
        return (
          (p.transactionId || "").toLowerCase().includes(q) ||
          p.bookingId.toLowerCase().includes(q) ||
          (customer?.name || "").toLowerCase().includes(q) ||
          p.mode.toLowerCase().includes(q)
        );
      });
    }

    if (statusFilter !== "all")
      result = result.filter((p) => p.status === statusFilter);
    if (modeFilter !== "all")
      result = result.filter((p) => p.mode === modeFilter);
    return result;
  }, [
    statusFilter,
    modeFilter,
    paymentsList,
    searchTerm,
    bookingMap,
    customerMap,
  ]);

  // Inject action button into navbar
  useEffect(() => {
    setHeaderAction(
      <Link href="/dashboard/payments/new">
        <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl h-10 px-5 shadow-sm shadow-[#7C3AED]/20 font-medium text-sm gap-2">
          <Plus className="h-4 w-4" />{" "}
          <span className="hidden sm:inline">Add Payment</span>
        </Button>
      </Link>,
    );
    return () => setHeaderAction(null);
  }, [setHeaderAction]);

  const handleDelete = async () => {
    if (selectedPayment) {
      try {
        await deletePayment(selectedPayment.id);
        // Optimistic update handled by page revalidation mostly, but locally:
        setPaymentsList((prev) =>
          prev.filter((p) => p.id !== selectedPayment.id),
        );
        setDeleteOpen(false);
        setSelectedPayment(null);
      } catch (e) {
        console.error("Failed to delete", e);
      }
    }
  };

  // Filters component for inline rendering
  const filtersContent = (
    <div className="flex items-center gap-2">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[130px] h-9 rounded-xl border-[#E8E5F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#64748B] dark:text-slate-300 shadow-none focus:ring-[#7C3AED]/20">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-[#E8E5F0] dark:border-slate-700 shadow-lg">
          <SelectItem value="all" className="rounded-lg">
            All Status
          </SelectItem>
          <SelectItem value="Paid" className="rounded-lg">
            Paid
          </SelectItem>
          <SelectItem value="Partial" className="rounded-lg">
            Partial
          </SelectItem>
          <SelectItem value="Pending" className="rounded-lg">
            Pending
          </SelectItem>
        </SelectContent>
      </Select>
      <Select value={modeFilter} onValueChange={setModeFilter}>
        <SelectTrigger className="w-[130px] h-9 rounded-xl border-[#E8E5F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#64748B] dark:text-slate-300 shadow-none focus:ring-[#7C3AED]/20">
          <SelectValue placeholder="All Modes" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-[#E8E5F0] dark:border-slate-700 shadow-lg">
          <SelectItem value="all" className="rounded-lg">
            All Modes
          </SelectItem>
          <SelectItem value="Cash" className="rounded-lg">
            Cash
          </SelectItem>
          <SelectItem value="UPI" className="rounded-lg">
            UPI
          </SelectItem>
          <SelectItem value="Card" className="rounded-lg">
            Card
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Track all payment transactions and invoices"
        breadcrumb={["Dashboard", "Payments"]}
        filters={filtersContent}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalRevenue)}
          icon={IndianRupee}
          trend={{ value: 12, positive: true }}
          description="vs last month"
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(pendingAmount)}
          icon={Clock}
          description="awaiting collection"
        />
        <StatCard
          title="Completed Payments"
          value={paidCount}
          icon={CheckCircle2}
          description={`of ${paymentsList.length} total`}
        />
      </div>

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
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => {
                  const booking = bookingMap.get(payment.bookingId);
                  const customer = booking
                    ? customerMap.get(booking.customerId)
                    : undefined;
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">
                        {payment.transactionId || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {payment.bookingId.toUpperCase()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {customer?.name || "—"}
                      </TableCell>
                      <TableCell className="text-sm">{payment.mode}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={payment.status}
                          variant="payment"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short" },
                            )
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPayment(payment);
                                setInvoiceOpen(true);
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" /> View Invoice
                            </DropdownMenuItem>
                            <Link
                              href={`/dashboard/payments/${payment.id}/edit`}
                            >
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setDeleteOpen(true);
                              }}
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

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete payment{" "}
              {selectedPayment?.transactionId}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
          </DialogHeader>
          {selectedPayment &&
            (() => {
              const booking = bookingMap.get(selectedPayment.bookingId);
              const customer = booking
                ? customerMap.get(booking.customerId)
                : undefined;
              const vehicle = booking
                ? vehicleMap.get(booking.vehicleId)
                : undefined;
              const days = booking
                ? Math.ceil(
                    (new Date(booking.dropDate).getTime() -
                      new Date(booking.pickupDate).getTime()) /
                      86400000,
                  )
                : 0;
              const subtotal = booking?.totalAmount || 0;
              const gst = Math.round(subtotal * 0.18);
              return (
                <div className="space-y-4">
                  <div className="text-center border-b pb-4">
                    <h3 className="text-lg font-bold">
                      SpeedWheels Car Rentals
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      42, 100 Feet Road, Indiranagar, Bangalore
                    </p>
                    <p className="text-xs text-muted-foreground">
                      GSTIN: 29AABCS1429B1ZB
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Invoice #</p>
                      <p className="font-medium">
                        INV-
                        {selectedPayment.transactionId
                          ? selectedPayment.transactionId.slice(-6)
                          : "PENDING"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Date</p>
                      <p className="font-medium">
                        {selectedPayment.paidAt
                          ? new Date(selectedPayment.paidAt).toLocaleDateString(
                              "en-IN",
                            )
                          : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Customer</p>
                      <p className="font-medium">{customer?.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Vehicle</p>
                      <p className="font-medium">
                        {vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Rental ({days} days ×{" "}
                        {formatCurrency(vehicle?.pricePerDay || 0)})
                      </span>
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
                    {subtotal + gst - selectedPayment.amount > 0 && (
                      <div className="flex justify-between text-destructive font-medium">
                        <span>Balance Due</span>
                        <span>
                          {formatCurrency(
                            subtotal + gst - selectedPayment.amount,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-center pt-2">
                    <p className="text-xs text-muted-foreground">
                      Payment Mode: {selectedPayment.mode}
                    </p>
                    <StatusBadge
                      status={selectedPayment.status}
                      variant="payment"
                    />
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
