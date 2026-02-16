import {
  getVehicles,
  getBookings,
  getPayments,
  getCustomers,
} from "@/lib/data";
import OverviewClient from "./client";

export default async function OverviewPage() {
  const [vehicles, bookings, payments, customers] = await Promise.all([
    getVehicles(),
    getBookings(),
    getPayments(),
    getCustomers(),
  ]);

  return (
    <div className="container pb-8 max-w-7xl mx-auto">
      <OverviewClient
        vehicles={vehicles}
        bookings={bookings}
        payments={payments}
        customers={customers}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
