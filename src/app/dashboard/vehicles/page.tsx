import { getVehicles } from "@/lib/data";
import VehiclesClient from "./client";

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return <VehiclesClient initialVehicles={vehicles} />;
}
