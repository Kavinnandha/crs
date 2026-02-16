"use client";

import { useState, useMemo } from "react";

import { createBooking } from "@/lib/actions";
import { Vehicle, Customer, Booking } from "@/types";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { calculateRentalPrice } from "@/lib/pricing";

interface NewBookingClientProps {
  vehicles: Vehicle[];
  customers: Customer[];
  bookings: Booking[];
}

export default function NewBookingClient({
  vehicles,
  customers,
  bookings,
}: NewBookingClientProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Booking>>({});

  const isVehicleBookedInRange = (
    vehicleId: string,
    pickup: string,
    drop: string,
  ) => {
    return bookings.some((b) => {
      if (b.vehicleId !== vehicleId) return false;
      if (b.status === "Cancelled" || b.status === "Completed") return false;
      const bStart = new Date(b.pickupDate).getTime();
      const bEnd = new Date(b.dropDate).getTime();
      const nStart = new Date(pickup).getTime();
      const nEnd = new Date(drop).getTime();
      return nStart < bEnd && nEnd > bStart;
    });
  };

  const availableVehicles = useMemo(() => {
    if (!formData.pickupDate || !formData.dropDate) return vehicles;
    return vehicles.filter(
      (v) =>
        v.status !== "Maintenance" &&
        !isVehicleBookedInRange(v.id, formData.pickupDate!, formData.dropDate!),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.pickupDate, formData.dropDate, vehicles, bookings]);

  const calculation = useMemo(() => {
    if (!formData.vehicleId || !formData.pickupDate || !formData.dropDate)
      return null;
    const vehicle = vehicles.find((v) => v.id === formData.vehicleId);
    if (!vehicle) return null;
    return calculateRentalPrice({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vehicle: vehicle as any,
      pickupDate: new Date(formData.pickupDate!),
      dropDate: new Date(formData.dropDate!),
    });
  }, [formData.vehicleId, formData.pickupDate, formData.dropDate, vehicles]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    // Append calculated values
    if (calculation) {
      form.append("totalAmount", calculation.total.toString());
      form.append(
        "charges",
        JSON.stringify({
          base: calculation.baseRate,
          extraKm: calculation.extraKmCharge,
          lateReturn: calculation.lateReturnCharge,
          fuelRefill: calculation.fuelRefillCharge,
          damage: calculation.damageCharge,
          securityDeposit: calculation.securityDeposit,
          tax: calculation.tax,
          total: calculation.total,
        }),
      );
    }

    try {
      await createBooking(form);
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
        <h1 className="text-2xl font-bold tracking-tight">New Booking</h1>
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
              <Label htmlFor="customerId">Customer</Label>
              <Select
                name="customerId"
                required
                onValueChange={(v) =>
                  setFormData({ ...formData, customerId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers
                    .filter((c) => c.verificationStatus === "Verified")
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} — {c.phone}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Pickup Date & Time</Label>
                <Input
                  type="datetime-local"
                  name="pickupDate"
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, pickupDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dropDate">Drop Date & Time</Label>
                <Input
                  type="datetime-local"
                  name="dropDate"
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, dropDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehicle</Label>
              <Select
                name="vehicleId"
                required
                onValueChange={(v) =>
                  setFormData({ ...formData, vehicleId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.brand} {v.model} — {formatCurrency(v.pricePerDay)}/day
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {calculation && (
              <div className="p-4 rounded-lg bg-muted border border-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Rate</span>
                  <span>{formatCurrency(calculation.baseRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(calculation.tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-medium text-base">
                  <span>Total Estimate</span>
                  <span>{formatCurrency(calculation.total)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea name="notes" placeholder="Additional instructions..." />
            </div>

            <input type="hidden" name="status" value="Reserved" />

            <div className="flex justify-end gap-2 pt-4">
              <Link href="/dashboard/bookings">
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
                Create Booking
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
