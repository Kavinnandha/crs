import 'dotenv/config';
import Admin from "../src/lib/models/Admin";
import dbConnect from "../src/lib/db";
import argon2 from "argon2";

async function seedAdmin() {
    try {
        console.log("Connecting to database...");
        await dbConnect();

        const email = "admin@carzio.com";
        const admin = await Admin.findOne({ email });

        if (admin) {
            console.log("Admin already exists");
            process.exit(0);
            return;
        }

        console.log("Creating admin user...");
        const hashedPassword = await argon2.hash("admin123");

        const newAdmin = await Admin.create({
            name: "Admin",
            email,
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin created successfully:", newAdmin.email);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
}

seedAdmin();
