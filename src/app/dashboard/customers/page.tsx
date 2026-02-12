
import { getCustomers, getBookings, getVehicles } from "@/lib/data";
import CustomersClient from "./client";

export default async function CustomersPage() {
    const [customers, bookings, vehicles] = await Promise.all([
        getCustomers(),
        getBookings(),
        getVehicles()
    ]);

    return (
        <CustomersClient
            customers={customers}
            bookings={bookings}
            vehicles={vehicles}
        />
    );
}
