import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import argon2 from "argon2";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Setup already completed. An admin already exists." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    const hashedPassword = await argon2.hash(password);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "superadmin",
    });

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      admin: { name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
