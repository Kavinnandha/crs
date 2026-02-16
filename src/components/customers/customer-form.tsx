"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { createCustomer, updateCustomer } from "@/lib/actions";
import { Customer } from "@/types";
import { useRouter } from "next/navigation";
import { ImageUpload } from "./image-upload";

export function CustomerForm({ customer }: { customer?: Customer }) {
    const router = useRouter();
    const isEdit = !!customer;

    const [aadharImage, setAadharImage] = useState<{ url: string; publicId: string } | null>(
        customer?.aadharImageUrl
            ? { url: customer.aadharImageUrl, publicId: customer.aadharImagePublicId || "" }
            : null
    );
    const [drivingLicenseImage, setDrivingLicenseImage] = useState<{ url: string; publicId: string } | null>(
        customer?.drivingLicenseImageUrl
            ? { url: customer.drivingLicenseImageUrl, publicId: customer.drivingLicenseImagePublicId || "" }
            : null
    );

    const [removingAadhar, setRemovingAadhar] = useState(false);
    const [removingLicense, setRemovingLicense] = useState(false);

    async function handleSubmit(formData: FormData) {
        // Append image data to form
        if (aadharImage) {
            formData.set("aadharImageUrl", aadharImage.url);
            formData.set("aadharImagePublicId", aadharImage.publicId);
        } else {
            formData.set("aadharImageUrl", "");
            formData.set("aadharImagePublicId", "");
        }

        if (drivingLicenseImage) {
            formData.set("drivingLicenseImageUrl", drivingLicenseImage.url);
            formData.set("drivingLicenseImagePublicId", drivingLicenseImage.publicId);
        } else {
            formData.set("drivingLicenseImageUrl", "");
            formData.set("drivingLicenseImagePublicId", "");
        }

        if (isEdit && customer) {
            await updateCustomer(customer.id, formData);
        } else {
            await createCustomer(formData);
        }
    }

    const handleRemoveAadhar = async () => {
        if (aadharImage?.publicId) {
            setRemovingAadhar(true);
            try {
                await fetch("/api/upload", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ publicId: aadharImage.publicId }),
                });
            } catch (error) {
                console.error("Error removing image:", error);
            } finally {
                setRemovingAadhar(false);
            }
        }
        setAadharImage(null);
    };

    const handleRemoveLicense = async () => {
        if (drivingLicenseImage?.publicId) {
            setRemovingLicense(true);
            try {
                await fetch("/api/upload", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ publicId: drivingLicenseImage.publicId }),
                });
            } catch (error) {
                console.error("Error removing image:", error);
            } finally {
                setRemovingLicense(false);
            }
        }
        setDrivingLicenseImage(null);
    };

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-card p-8 rounded-2xl border border-border shadow-sm">
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

            {/* Document Upload Section */}
            <div className="space-y-4 pt-2">
                <h3 className="text-base font-semibold text-[#1a1d2e] dark:text-white">
                    Identity Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUpload
                        label="Aadhar Card"
                        currentImageUrl={aadharImage?.url}
                        currentPublicId={aadharImage?.publicId}
                        onUploadComplete={(url, publicId) => setAadharImage({ url, publicId })}
                        onRemove={handleRemoveAadhar}
                        isRemoving={removingAadhar}
                    />
                    <ImageUpload
                        label="Driving License"
                        currentImageUrl={drivingLicenseImage?.url}
                        currentPublicId={drivingLicenseImage?.publicId}
                        onUploadComplete={(url, publicId) => setDrivingLicenseImage({ url, publicId })}
                        onRemove={handleRemoveLicense}
                        isRemoving={removingLicense}
                    />
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
