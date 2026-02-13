
import { getPaymentById, getBookings, getCustomers } from "@/lib/data";
import EditPaymentClient from "./client";
import { notFound } from "next/navigation";

export default async function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [payment, bookings, customers] = await Promise.all([
        getPaymentById(id),
        getBookings(),
        getCustomers()
    ]);

    if (!payment) {
        notFound();
    }

    return (
        <div className="container py-8">
            <EditPaymentClient payment={payment} bookings={bookings} customers={customers} />
        </div>
    );
}

export const dynamic = "force-dynamic";
