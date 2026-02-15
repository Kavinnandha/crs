"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface AdminFormProps {
    initialData?: {
        name: string;
        email: string;
        role: "admin" | "superadmin";
    };
    onSubmit: (formData: FormData) => Promise<void>;
    onCancel: () => void;
    submitLabel: string;
}

export function AdminForm({ initialData, onSubmit, onCancel, submitLabel }: AdminFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        // For create mode, password is required and must be validated
        if (!initialData) {
            const password = formData.get("password") as string;
            if (password.length < 8) {
                setError("Password must be at least 8 characters");
                setSubmitting(false);
                return;
            }
        } else {
            // For edit mode, if password is provided, validate it
            const password = formData.get("password") as string;
            if (password && password.length < 8) {
                setError("Password must be at least 8 characters");
                setSubmitting(false);
                return;
            }
        }

        try {
            await onSubmit(formData);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong");
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        name="name"
                        required={!initialData}
                        defaultValue={initialData?.name}
                        placeholder="John Doe"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required={!initialData}
                        defaultValue={initialData?.email}
                        placeholder="Email"
                        disabled={!!initialData} // Email usually shouldn't change for identity reasons, or handle carefully
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="password">Password {initialData && "(Leave blank to keep current)"}</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required={!initialData}
                            placeholder={initialData ? "********" : "Min 8 characters"}
                            minLength={8}
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-[#94a3b8] hover:text-[#64748B] dark:hover:text-slate-300"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" defaultValue={initialData?.role || "admin"}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            {/* Super Admin option removed as per requirement */}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-[#7C3AED] hover:bg-[#6D28D9]">
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
