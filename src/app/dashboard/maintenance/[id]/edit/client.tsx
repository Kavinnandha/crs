"use client";

import { useState } from "react";

import { updateMaintenance } from "@/lib/actions";
import { Vehicle, MaintenanceRecord, ServiceType } from "@/types";
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

const serviceTypes: ServiceType[] = [
  "Oil Change",
  "Tire Replacement",
  "Brake Service",
  "Engine Repair",
  "AC Service",
  "General Service",
  "Body Repair",
  "Battery Replacement",
];

interface EditMaintenanceClientProps {
  record: MaintenanceRecord;
  vehicles: Vehicle[];
}

export default function EditMaintenanceClient({
  record,
  vehicles,
}: EditMaintenanceClientProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    try {
      await updateMaintenance(record.id, formData);
      // Redirect handled in server action
    } catch (e) {
      setError((e as Error).message || "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/maintenance">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Edit Maintenance Record
        </h1>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Record Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehicle</Label>
              <Select name="vehicleId" defaultValue={record.vehicleId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.registrationNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select
                  name="serviceType"
                  defaultValue={record.serviceType}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceDate">Service Date</Label>
                <Input
                  type="date"
                  name="serviceDate"
                  defaultValue={
                    record.serviceDate
                      ? new Date(record.serviceDate).toISOString().split("T")[0]
                      : ""
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost (₹)</Label>
                <Input
                  type="number"
                  name="cost"
                  defaultValue={record.cost}
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextServiceDate">
                  Next Service Due (Optional)
                </Label>
                <Input
                  type="date"
                  name="nextServiceDate"
                  defaultValue={
                    record.nextServiceDate
                      ? new Date(record.nextServiceDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor / Service Center</Label>
              <Input name="vendor" defaultValue={record.vendor} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea name="description" defaultValue={record.description} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Link href="/dashboard/maintenance">
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
                Update Record
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
