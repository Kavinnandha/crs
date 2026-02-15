"use server";

import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import argon2 from "argon2";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getAdmins() {
    await dbConnect();
    try {
        const admins = await Admin.find({}).select("-password").sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(admins));
    } catch (error) {
        console.error("Error fetching admins:", error);
        return [];
    }
}

export async function createAdmin(formData: FormData) {
    await dbConnect();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || "admin";

    if (!name || !email || !password) {
        throw new Error("Name, email, and password are required");
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
        throw new Error("An admin with this email already exists");
    }

    const hashedPassword = await argon2.hash(password);

    try {
        await Admin.create({
            name,
            email,
            password: hashedPassword,
            role,
        });
    } catch (error) {
        console.error("Error creating admin:", error);
        throw new Error("Failed to create admin");
    }

    revalidatePath("/dashboard/admins");
    redirect("/dashboard/admins");
}

export async function deleteAdmin(id: string) {
    await dbConnect();

    const count = await Admin.countDocuments();
    if (count <= 1) {
        throw new Error("Cannot delete the last admin");
    }

    try {
        await Admin.findByIdAndDelete(id);
        revalidatePath("/dashboard/admins");
    } catch (error) {
        console.error("Error deleting admin:", error);
        throw new Error("Failed to delete admin");
    }
}

export async function updateAdmin(id: string, formData: FormData) {
    await dbConnect();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || "admin";

    if (!name || !email) {
        throw new Error("Name and email are required");
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = { name, email, role };

        if (password && password.length >= 8) {
            updateData.password = await argon2.hash(password);
        }

        await Admin.findByIdAndUpdate(id, updateData);
        revalidatePath("/dashboard/admins");
        redirect("/dashboard/admins");
    } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            throw error;
        }
        console.error("Error updating admin:", error);
        throw new Error("Failed to update admin");
    }
}

export async function getAdminById(id: string) {
    await dbConnect();
    try {
        const admin = await Admin.findById(id).select("-password").lean();
        if (!admin) return null;
        return JSON.parse(JSON.stringify(admin));
    } catch (error) {
        console.error("Error fetching admin:", error);
        return null;
    }
}
