
import { getBookingById, getVehicles, getCustomers } from "@/lib/data";
import EditBookingClient from "./client";
import { notFound } from "next/navigation";

export default async function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [booking, vehicles, customers] = await Promise.all([
        getBookingById(id),
        getVehicles(),
        getCustomers()
    ]);

    if (!booking) {
        notFound();
    }

    return (
        <div className="container py-8">
            <EditBookingClient booking={booking} vehicles={vehicles} customers={customers} />
        </div>
    );
}

export const dynamic = "force-dynamic";
