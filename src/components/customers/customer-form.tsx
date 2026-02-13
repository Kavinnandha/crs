"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { createCustomer, updateCustomer } from "@/lib/actions";
import { Customer } from "@/types";
import { useRouter } from "next/navigation";

export function CustomerForm({ customer }: { customer?: Customer }) {
    const router = useRouter();
    const isEdit = !!customer;

    async function handleSubmit(formData: FormData) {
        if (isEdit && customer) {
            await updateCustomer(customer.id, formData);
        } else {
            await createCustomer(formData);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" defaultValue={customer?.name} required placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" defaultValue={customer?.email} required placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" name="phone" defaultValue={customer?.phone} required placeholder="+91 9876543210" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="drivingLicenseNumber">License Number *</Label>
                    <Input id="drivingLicenseNumber" name="drivingLicenseNumber" defaultValue={customer?.drivingLicenseNumber} required placeholder="AB1234567890" className="uppercase" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" defaultValue={customer?.address} placeholder="123 Main St, City" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="verificationStatus">Verification Status</Label>
                    <Select name="verificationStatus" defaultValue={customer?.verificationStatus || "Pending"}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Verified">Verified</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <SubmitButton isEdit={isEdit} />
            </div>
        </form>
    );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="min-w-[120px] bg-[#7C3AED] hover:bg-[#6D28D9]">
            {pending ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Customer" : "Create Customer")}
        </Button>
    );
}
