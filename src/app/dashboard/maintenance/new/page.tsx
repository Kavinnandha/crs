
import { getVehicles } from "@/lib/data";
import NewMaintenanceClient from "@/app/dashboard/maintenance/new/client";

export default async function NewMaintenancePage() {
    const vehicles = await getVehicles();
    return (
        <div className="container py-8">
            <NewMaintenanceClient vehicles={vehicles} />
        </div>
    );
}

// Ensure dynamic rendering to avoid stale data
export const dynamic = "force-dynamic";
