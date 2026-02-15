"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/admins/admin-form";
import { getAdminById, updateAdmin } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditAdminPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [admin, setAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminById(id).then((data) => {
            if (data) setAdmin(data);
            setLoading(false);
        });
    }, [id]);

    async function handleSubmit(formData: FormData) {
        await updateAdmin(id, formData);
        router.push("/dashboard/admins");
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" /></div>;
    }

    if (!admin) {
        return <div className="text-center">Admin not found</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admins">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-[#1a1d2e] dark:text-white">Edit Admin</h1>
            </div>

            <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-[#1a1d2e] dark:text-white">Edit Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <AdminForm
                        initialData={admin}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push("/dashboard/admins")}
                        submitLabel="Update Admin"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
