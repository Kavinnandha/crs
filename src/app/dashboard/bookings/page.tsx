import { getBookings, getCustomers, getVehicles } from "@/lib/data";
import BookingsClient from "./client";

export default async function BookingsPage() {
  const [bookings, customers, vehicles] = await Promise.all([
    getBookings(),
    getCustomers(),
    getVehicles(),
  ]);

  return (
    <BookingsClient
      initialBookings={bookings}
      customers={customers}
      vehicles={vehicles}
    />
  );
}
