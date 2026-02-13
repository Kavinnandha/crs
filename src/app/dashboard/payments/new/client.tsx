"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPayment } from "@/lib/actions";
import { Booking, Customer, PaymentMode, PaymentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface NewPaymentClientProps {
    bookings: Booking[];
    customers: Customer[];
}

export default function NewPaymentClient({ bookings, customers }: NewPaymentClientProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        bookingId: "",
        amount: 0,
        mode: "Cash" as PaymentMode,
        status: "Pending" as PaymentStatus,
        transactionId: "",
        paidAt: new Date().toISOString().slice(0, 16)
    });

    const bookingMap = new Map(bookings.map(b => [b.id, b]));
    const customerMap = new Map(customers.map(c => [c.id, c]));

    const handleBookingChange = (bookingId: string) => {
        const booking = bookingMap.get(bookingId);
        setFormData(prev => ({
            ...prev,
            bookingId,
            amount: booking ? booking.totalAmount : 0
        }));
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const form = new FormData();
        form.append("bookingId", formData.bookingId);
        form.append("amount", formData.amount.toString());
        form.append("mode", formData.mode);
        form.append("status", formData.status);
        if (formData.transactionId) form.append("transactionId", formData.transactionId);
        if (formData.paidAt) form.append("paidAt", new Date(formData.paidAt).toISOString());

        try {
            await createPayment(form);
        } catch (e: any) {
            setError(e.message || "Something went wrong");
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
                <h1 className="text-2xl font-bold tracking-tight">New Payment</h1>
            </div>

            <Card className="border-[#E8E5F0] shadow-sm">
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="bookingId">Booking</Label>
                                <Select name="bookingId" required onValueChange={handleBookingChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select booking" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bookings.map((b) => {
                                            const c = customerMap.get(b.customerId);
                                            return (
                                                <SelectItem key={b.id} value={b.id}>
                                                    {b.id.toUpperCase()} — {c?.name} ({formatCurrency(b.totalAmount)})
                                                </SelectItem>
                                            );
                                        })}
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
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mode">Payment Mode</Label>
                                <Select name="mode" value={formData.mode} onValueChange={(v) => setFormData({ ...formData, mode: v as PaymentMode })}>
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
                                <Select name="status" value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as PaymentStatus })}>
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
                                    onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="transactionId">Transaction ID</Label>
                                <Input
                                    name="transactionId"
                                    placeholder="Optional for cash/pending"
                                    value={formData.transactionId}
                                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Link href="/dashboard/payments">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={submitting} className="bg-[#7C3AED] hover:bg-[#6D28D9]">
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Payment
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
