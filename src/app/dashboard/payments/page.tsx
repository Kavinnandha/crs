
import { getPayments, getBookings, getCustomers, getVehicles } from "@/lib/data";
import PaymentsClient from "./client";

export default async function PaymentsPage() {
    const [payments, bookings, customers, vehicles] = await Promise.all([
        getPayments(),
        getBookings(),
        getCustomers(),
        getVehicles(),
    ]);

    return (
        <PaymentsClient
            initialPayments={payments}
            bookings={bookings}
            customers={customers}
            vehicles={vehicles}
        />
    );
}
