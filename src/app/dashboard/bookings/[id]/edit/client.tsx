"use client";

import { useState, useMemo } from "react";

import { updateBooking } from "@/lib/actions";
import { Vehicle, Customer, Booking } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { calculateRentalPrice } from "@/lib/pricing";

interface EditBookingClientProps {
    booking: Booking;
    vehicles: Vehicle[];
    customers: Customer[];
}

export default function EditBookingClient({ booking, vehicles, customers }: EditBookingClientProps) {

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Booking>>({
        vehicleId: booking.vehicleId,
        pickupDate: booking.pickupDate,
        dropDate: booking.dropDate
    });

    const calculation = useMemo(() => {
        if (!formData.vehicleId || !formData.pickupDate || !formData.dropDate) return null;
        const vehicle = vehicles.find(v => v.id === formData.vehicleId);
        if (!vehicle) return null;
        return calculateRentalPrice({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vehicle: vehicle as any,
            pickupDate: new Date(formData.pickupDate!),
            dropDate: new Date(formData.dropDate!)
        });
    }, [formData.vehicleId, formData.pickupDate, formData.dropDate, vehicles]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const form = new FormData(e.currentTarget);
        if (calculation) {
            form.append("totalAmount", calculation.total.toString());
        }

        try {
            await updateBooking(booking.id, form);
        } catch (e) {
            setError((e as Error).message || "Something went wrong");
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/bookings">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Edit Booking</h1>
            </div>

            <Card className="border-border shadow-sm">
                <CardHeader>
                    <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue={booking.status}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Reserved">Reserved</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customerId">Customer</Label>
                            <Select name="customerId" defaultValue={booking.customerId} disabled>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="pickupDate">Pickup Date</Label>
                                <Input
                                    type="datetime-local"
                                    name="pickupDate"
                                    defaultValue={new Date(booking.pickupDate).toISOString().slice(0, 16)}
                                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dropDate">Drop Date</Label>
                                <Input
                                    type="datetime-local"
                                    name="dropDate"
                                    defaultValue={new Date(booking.dropDate).toISOString().slice(0, 16)}
                                    onChange={(e) => setFormData({ ...formData, dropDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vehicleId">Vehicle</Label>
                            <Select name="vehicleId" defaultValue={booking.vehicleId} onValueChange={(v) => setFormData({ ...formData, vehicleId: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select vehicle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicles.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            {v.brand} {v.model}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {calculation && (
                            <div className="p-4 rounded-lg bg-muted border border-border space-y-2 text-sm">
                                <div className="flex justify-between font-medium text-base">
                                    <span>New Total Estimate</span>
                                    <span>{formatCurrency(calculation.total)}</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea name="notes" defaultValue={booking.notes} />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Link href="/dashboard/bookings">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={submitting} className="bg-[#7C3AED] hover:bg-[#6D28D9]">
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Booking
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
