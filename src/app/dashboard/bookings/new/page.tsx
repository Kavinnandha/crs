import { getVehicles, getCustomers, getBookings } from "@/lib/data";
import NewBookingClient from "@/app/dashboard/bookings/new/client";

export default async function NewBookingPage() {
  const [vehicles, customers, bookings] = await Promise.all([
    getVehicles(),
    getCustomers(),
    getBookings(),
  ]);

  return (
    <div className="container py-8">
      <NewBookingClient
        vehicles={vehicles}
        customers={customers}
        bookings={bookings}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
