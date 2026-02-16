import { PageHeader } from "@/components/layout/page-header";
import { CustomerForm } from "@/components/customers/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Add New Customer"
        description="Create a new customer profile"
        breadcrumb={["Dashboard", "Customers", "Add"]}
      />
      <CustomerForm />
    </div>
  );
}
