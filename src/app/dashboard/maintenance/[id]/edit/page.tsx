
import { getMaintenanceById, getVehicles } from "@/lib/data";
import EditMaintenanceClient from "./client";
import { notFound } from "next/navigation";

export default async function EditMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [record, vehicles] = await Promise.all([
        getMaintenanceById(id),
        getVehicles()
    ]);

    if (!record) {
        notFound();
    }

    return (
        <div className="container py-8">
            <EditMaintenanceClient record={record} vehicles={vehicles} />
        </div>
    );
}
