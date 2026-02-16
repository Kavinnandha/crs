import mongoose from "mongoose";
import Vehicle from "../src/lib/models/Vehicle";
import Customer from "../src/lib/models/Customer";
import Booking from "../src/lib/models/Booking";
import Payment from "../src/lib/models/Payment";
import Maintenance from "../src/lib/models/Maintenance";
import {
  vehicles,
  customers,
  bookings,
  payments,
  maintenanceRecords,
} from "../src/lib/mock-data";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "Please define the MONGODB_URI environment variable inside .env",
  );
  process.exit(1);
}

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected!");

    console.log("Clearing existing data...");
    await Vehicle.deleteMany({});
    await Customer.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await Maintenance.deleteMany({});

    console.log("Seeding Vehicles...");
    await Vehicle.insertMany(vehicles);

    console.log("Seeding Customers...");
    await Customer.insertMany(customers);

    console.log("Seeding Bookings...");
    await Booking.insertMany(bookings);

    console.log("Seeding Payments...");
    await Payment.insertMany(payments);

    console.log("Seeding Maintenance Records...");
    await Maintenance.insertMany(maintenanceRecords);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
