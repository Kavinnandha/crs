"use client";

import { createAdmin } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/admins/admin-form";

export default function NewAdminPage() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    await createAdmin(formData);
    router.push("/dashboard/admins");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admins">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1d2e] dark:text-white">
          Add New Admin
        </h1>
      </div>

      <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-[#1a1d2e] dark:text-white">
            Admin Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminForm
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/admins")}
            submitLabel="Create Admin"
          />
        </CardContent>
      </Card>
    </div>
  );
}
