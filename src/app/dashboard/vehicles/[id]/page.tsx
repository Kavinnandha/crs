import { PageHeader } from "@/components/layout/page-header";
import { getVehicleById, getBookings } from "@/lib/data";
import { notFound } from "next/navigation";
import { Booking } from "@/types";
import { StatusBadge } from "@/components/tables/status-badge";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil, ArrowLeft, DollarSign, Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function VehicleDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    notFound();
  }

  const allBookings = await getBookings();
  const vehicleBookings = allBookings
    .filter((b: Booking) => b.vehicleId === vehicle.id)
    .sort(
      (a: Booking, b: Booking) =>
        new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime(),
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={`${vehicle.brand} ${vehicle.model}`}
          description="Vehicle Details & History"
          breadcrumb={[
            "Dashboard",
            "Vehicles",
            vehicle.brand + " " + vehicle.model,
          ]}
        />
        <div className="flex gap-2">
          <Link href="/dashboard/vehicles">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Vehicles
            </Button>
          </Link>
          <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
            <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white gap-2">
              <Pencil className="h-4 w-4" /> Edit Vehicle
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <Card className="lg:col-span-2 shadow-sm border-[#E8E5F0] dark:border-slate-800 card-full-details">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Vehicle Information</CardTitle>
            <StatusBadge status={vehicle.status} variant="vehicle" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Registration
                </h4>
                <p className="font-mono text-lg">
                  {vehicle.registrationNumber}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Category
                </h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                  {vehicle.category}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Year
                </h4>
                <p className="text-base">{vehicle.year}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Fuel & Transmission
                </h4>
                <p className="text-base">
                  {vehicle.fuelType} • {vehicle.transmission}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Color
                </h4>
                <p className="text-base">{vehicle.color}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Mileage
                </h4>
                <p className="text-base">{vehicle.mileage || "N/A"} km/l</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <Card className="shadow-sm border-[#E8E5F0] dark:border-slate-800">
            <CardHeader>
              <CardTitle>Pricing & Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center text-violet-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Rate</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(vehicle.pricePerDay)}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Bookings
                  </p>
                  <p className="text-xl font-bold">{vehicleBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking History */}
      <Card className="shadow-sm border-[#E8E5F0] dark:border-slate-800">
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          {vehicleBookings.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No bookings found for this vehicle.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleBookings.map((booking: Booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.customerId}
                    </TableCell>
                    <TableCell>
                      {new Date(booking.pickupDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(booking.dropDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} variant="booking" />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(booking.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
