import { PageHeader } from "@/components/layout/page-header";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { getVehicleById } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const vehicle = await getVehicleById(id);

    if (!vehicle) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader
                title="Edit Vehicle"
                description={`Update details for ${vehicle.brand} ${vehicle.model}`}
                breadcrumb={["Dashboard", "Vehicles", vehicle.brand + " " + vehicle.model, "Edit"]}
            />
            <VehicleForm vehicle={vehicle} />
        </div>
    );
}
