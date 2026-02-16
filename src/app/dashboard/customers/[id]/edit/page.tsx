import { PageHeader } from "@/components/layout/page-header";
import { CustomerForm } from "@/components/customers/customer-form";
import { getCustomerById } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Edit Customer"
        description={`Update profile for ${customer.name}`}
        breadcrumb={["Dashboard", "Customers", customer.name, "Edit"]}
      />
      <CustomerForm customer={customer} />
    </div>
  );
}
