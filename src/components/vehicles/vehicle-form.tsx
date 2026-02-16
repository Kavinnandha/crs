"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { createVehicle, updateVehicle } from "@/lib/actions";
import { Vehicle } from "@/types";
import { useRouter } from "next/navigation";

// Form Component
export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const router = useRouter();
  const isEdit = !!vehicle;

  // Use router for client-side navigation after server action if needed,
  // but server action redirects.

  async function handleSubmit(formData: FormData) {
    if (isEdit && vehicle) {
      await updateVehicle(vehicle.id, formData);
    } else {
      await createVehicle(formData);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-6 max-w-5xl mx-auto bg-card p-8 rounded-2xl border border-border shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            name="brand"
            defaultValue={vehicle?.brand}
            required
            placeholder="Toyota"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            name="model"
            defaultValue={vehicle?.model}
            required
            placeholder="Camry"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            defaultValue={vehicle?.year}
            required
            placeholder="2024"
            min="2000"
            max="2030"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Registration Number</Label>
          <Input
            id="registrationNumber"
            name="registrationNumber"
            defaultValue={vehicle?.registrationNumber}
            required
            placeholder="KA-01-AB-1234"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" defaultValue={vehicle?.category}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hatchback">Hatchback</SelectItem>
              <SelectItem value="Sedan">Sedan</SelectItem>
              <SelectItem value="SUV">SUV</SelectItem>
              <SelectItem value="Luxury">Luxury</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fuelType">Fuel Type</Label>
          <Select name="fuelType" defaultValue={vehicle?.fuelType}>
            <SelectTrigger>
              <SelectValue placeholder="Select Fuel Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Petrol">Petrol</SelectItem>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="Electric">Electric</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="transmission">Transmission</Label>
          <Select name="transmission" defaultValue={vehicle?.transmission}>
            <SelectTrigger>
              <SelectValue placeholder="Select Transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Automatic">Automatic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={vehicle?.status || "Available"}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Rented">Rented</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pricePerDay">Price Per Day (₹)</Label>
          <Input
            id="pricePerDay"
            name="pricePerDay"
            type="number"
            defaultValue={vehicle?.pricePerDay}
            required
            placeholder="2000"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            name="color"
            defaultValue={vehicle?.color}
            placeholder="White"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mileage">Mileage (km/l)</Label>
          <Input
            id="mileage"
            name="mileage"
            type="number"
            defaultValue={vehicle?.mileage}
            placeholder="15"
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="min-w-[120px]">
      {pending
        ? isEdit
          ? "Updating..."
          : "Creating..."
        : isEdit
          ? "Update Vehicle"
          : "Create Vehicle"}
    </Button>
  );
}
