
import { getVehicles, getBookings } from "@/lib/data";
import VehiclesClient from "./client";

export default async function VehiclesPage() {
    const [vehicles, bookings] = await Promise.all([
        getVehicles(),
        getBookings(),
    ]);

    return <VehiclesClient initialVehicles={vehicles} bookings={bookings} />;
}
