
import { getMaintenanceRecords, getVehicles } from "@/lib/data";
import MaintenanceClient from "./client";

export default async function MaintenancePage() {
    const [records, vehicles] = await Promise.all([
        getMaintenanceRecords(),
        getVehicles()
    ]);

    return <MaintenanceClient initialRecords={records} vehicles={vehicles} />;
}
