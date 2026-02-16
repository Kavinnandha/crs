"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { createCustomer, updateCustomer } from "@/lib/actions";
import { Customer } from "@/types";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Upload, FileImage, X } from "lucide-react";
import { toast } from "sonner";

export function CustomerForm({ customer }: { customer?: Customer }) {
    const router = useRouter();
    const isEdit = !!customer;
    const [drivingLicenseFile, setDrivingLicenseFile] = useState<File | null>(null);
    const [aadhaarCardFile, setAadhaarCardFile] = useState<File | null>(null);
    const [drivingLicensePreview, setDrivingLicensePreview] = useState<string | null>(customer?.drivingLicenseImage || null);
    const [aadhaarCardPreview, setAadhaarCardPreview] = useState<string | null>(customer?.aadhaarCardImage || null);
    const [uploading, setUploading] = useState(false);
    const dlInputRef = useRef<HTMLInputElement>(null);
    const aadhaarInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 1024 * 1024; // 1MB

        if (!allowedTypes.includes(file.type)) {
            return 'Invalid file type. Only JPG and PNG are allowed.';
        }

        if (file.size > maxSize) {
            return 'File size exceeds 1MB limit.';
        }

        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'dl' | 'aadhaar') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const error = validateFile(file);
        if (error) {
            toast.error(error);
            e.target.value = '';
            return;
        }

        if (type === 'dl') {
            setDrivingLicenseFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setDrivingLicensePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setAadhaarCardFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAadhaarCardPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadFile = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            return data.path;
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to upload file');
            return null;
        }
    };

    async function handleSubmit(formData: FormData) {
        setUploading(true);

        try {
            // Upload files if new files are selected
            if (drivingLicenseFile) {
                const path = await uploadFile(drivingLicenseFile);
                if (path) {
                    formData.append('drivingLicenseImage', path);
                } else {
                    setUploading(false);
                    return;
                }
            } else if (customer?.drivingLicenseImage) {
                formData.append('drivingLicenseImage', customer.drivingLicenseImage);
            }

            if (aadhaarCardFile) {
                const path = await uploadFile(aadhaarCardFile);
                if (path) {
                    formData.append('aadhaarCardImage', path);
                } else {
                    setUploading(false);
                    return;
                }
            } else if (customer?.aadhaarCardImage) {
                formData.append('aadhaarCardImage', customer.aadhaarCardImage);
            }

            if (isEdit && customer) {
                await updateCustomer(customer.id, formData);
            } else {
                await createCustomer(formData);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error('Failed to save customer');
            setUploading(false);
        }
    }

    const removeFile = (type: 'dl' | 'aadhaar') => {
        if (type === 'dl') {
            setDrivingLicenseFile(null);
            setDrivingLicensePreview(customer?.drivingLicenseImage || null);
            if (dlInputRef.current) dlInputRef.current.value = '';
        } else {
            setAadhaarCardFile(null);
            setAadhaarCardPreview(customer?.aadhaarCardImage || null);
            if (aadhaarInputRef.current) aadhaarInputRef.current.value = '';
        }
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

                {/* Driving License Upload */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="drivingLicense">Driving License Image</Label>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <Input
                                ref={dlInputRef}
                                id="drivingLicense"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={(e) => handleFileChange(e, 'dl')}
                                className="flex-1"
                            />
                            {(drivingLicenseFile || drivingLicensePreview) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeFile('dl')}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Accepted: JPG, PNG (Max 1MB)
                        </p>
                        {drivingLicensePreview && (
                            <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                                <img
                                    src={drivingLicensePreview}
                                    alt="Driving License Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Aadhaar Card Upload */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="aadhaarCard">Aadhaar Card Image</Label>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <Input
                                ref={aadhaarInputRef}
                                id="aadhaarCard"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={(e) => handleFileChange(e, 'aadhaar')}
                                className="flex-1"
                            />
                            {(aadhaarCardFile || aadhaarCardPreview) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeFile('aadhaar')}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Accepted: JPG, PNG (Max 1MB)
                        </p>
                        {aadhaarCardPreview && (
                            <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                                <img
                                    src={aadhaarCardPreview}
                                    alt="Aadhaar Card Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <SubmitButton isEdit={isEdit} uploading={uploading} />
            </div>
        </form>
    );
}

function SubmitButton({ isEdit, uploading }: { isEdit: boolean; uploading: boolean }) {
    const { pending } = useFormStatus();
    const isDisabled = pending || uploading;
    return (
        <Button type="submit" disabled={isDisabled} className="min-w-[120px] bg-[#7C3AED] hover:bg-[#6D28D9]">
            {isDisabled ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Customer" : "Create Customer")}
        </Button>
    );
}
