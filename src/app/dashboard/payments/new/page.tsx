import { getBookings, getCustomers } from "@/lib/data";
import NewPaymentClient from "@/app/dashboard/payments/new/client";

export default async function NewPaymentPage() {
  const [bookings, customers] = await Promise.all([
    getBookings(),
    getCustomers(),
  ]);

  return (
    <div className="container py-8">
      <NewPaymentClient bookings={bookings} customers={customers} />
    </div>
  );
}

export const dynamic = "force-dynamic";
