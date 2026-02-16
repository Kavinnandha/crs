import { getVehicles, getBookings, getPayments } from "@/lib/data";
import ReportsClient from "./client";

export default async function ReportsPage() {
  const [vehicles, bookings, payments] = await Promise.all([
    getVehicles(),
    getBookings(),
    getPayments(),
  ]);

  return (
    <div className="container pb-8 max-w-7xl mx-auto">
      <ReportsClient
        vehicles={vehicles}
        bookings={bookings}
        payments={payments}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
