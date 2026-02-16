import { PageHeader } from "@/components/layout/page-header";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

export default function NewVehiclePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Add New Vehicle"
        description="Create a new vehicle record"
        breadcrumb={["Dashboard", "Vehicles", "Add"]}
      />
      <VehicleForm />
    </div>
  );
}
