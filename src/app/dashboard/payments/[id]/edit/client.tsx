"use client";

import { useState } from "react";

import { updatePayment } from "@/lib/actions";
import { Payment, Booking, Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface EditPaymentClientProps {
  payment: Payment;
  bookings: Booking[];
  customers: Customer[];
}

export default function EditPaymentClient({
  payment,
  bookings,
}: EditPaymentClientProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bookingId: payment.bookingId,
    amount: payment.amount,
    mode: payment.mode,
    status: payment.status,
    transactionId: payment.transactionId || "",
    paidAt: payment.paidAt
      ? new Date(payment.paidAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData();
    form.append("bookingId", formData.bookingId);
    form.append("amount", formData.amount.toString());
    form.append("mode", formData.mode);
    form.append("status", formData.status);
    if (formData.transactionId)
      form.append("transactionId", formData.transactionId);
    if (formData.paidAt)
      form.append("paidAt", new Date(formData.paidAt).toISOString());

    try {
      await updatePayment(payment.id, form);
    } catch (e) {
      setError((e as Error).message || "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/payments">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit Payment</h1>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bookingId">Booking</Label>
                <Select
                  name="bookingId"
                  defaultValue={payment.bookingId}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bookings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.id.toUpperCase()} ({formatCurrency(b.totalAmount)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Payment Mode</Label>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Select
                  name="mode"
                  value={formData.mode}
                  onValueChange={(v) =>
                    setFormData({ ...formData, mode: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData({ ...formData, status: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paidAt">Payment Date</Label>
                <Input
                  type="datetime-local"
                  name="paidAt"
                  value={formData.paidAt}
                  onChange={(e) =>
                    setFormData({ ...formData, paidAt: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  name="transactionId"
                  placeholder="Optional"
                  value={formData.transactionId}
                  onChange={(e) =>
                    setFormData({ ...formData, transactionId: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Link href="/dashboard/payments">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#7C3AED] hover:bg-[#6D28D9]"
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Payment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
