"use client";

import { useState } from "react";
import { createVehicle, getVehicles } from "@/lib/actions/vehicle";
import { createCustomer, getCustomers } from "@/lib/actions/customer";
import { createBooking, getBookings } from "@/lib/actions/booking";

export default function VerifyPage() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  const runVerification = async () => {
    addLog("Starting verification...");

    // 1. Test Vehicle
    addLog("--- Testing Vehicle ---");
    const vehicleRes = await createVehicle({
      id: `V-${Date.now()}`,
      brand: "Toyota",
      model: "Corolla",
      year: 2024,
      category: "Sedan",
      registrationNumber: `ABC-${Math.floor(Math.random() * 10000)}`,
      pricePerDay: 50,
      fuelType: "petrol",
      transmission: "automatic",
      status: "Available",
      imageUrl: "https://placehold.co/600x400",
      mileage: 0,
      color: "White",
    });
    addLog(`Create Vehicle: ${JSON.stringify(vehicleRes)}`);

    const vehiclesRes = await getVehicles();
    addLog(`Get Vehicles: Found ${vehiclesRes.data?.length || 0} vehicles`);

    if (!vehicleRes.success || !vehiclesRes.success) {
      addLog("Vehicle tests failed!");
      return;
    }

    const vehicleId = vehicleRes.data._id;

    // 2. Test Customer
    addLog("--- Testing Customer ---");
    const customerRes = await createCustomer({
      id: `C-${Date.now()}`,
      name: "John Doe",
      email: `john-${Math.floor(Math.random() * 10000)}@example.com`,
      phone: "1234567890",
      drivingLicenseNumber: `DL-${Math.floor(Math.random() * 100000)}`,
    });
    addLog(`Create Customer: ${JSON.stringify(customerRes)}`);

    const customersRes = await getCustomers();
    addLog(`Get Customers: Found ${customersRes.data?.length || 0} customers`);

    if (!customerRes.success || !customersRes.success) {
      addLog("Customer tests failed!");
      return;
    }

    const customerId = customerRes.data._id;

    // 3. Test Booking
    addLog("--- Testing Booking ---");
    const bookingRes = await createBooking({
      id: `B-${Date.now()}`,
      customerId: customerId,
      vehicleId: vehicleId,
      pickupDate: new Date(),
      dropDate: new Date(Date.now() + 86400000), // +1 day
      totalAmount: 100,
      status: "Confirmed",
    });
    addLog(`Create Booking: ${JSON.stringify(bookingRes)}`);

    const bookingsRes = await getBookings();
    addLog(`Get Bookings: Found ${bookingsRes.data?.length || 0} bookings`);

    addLog("Verification complete!");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">MongoDB Verification</h1>
      <button
        onClick={runVerification}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
      >
        Run Verification
      </button>
      <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded h-96 overflow-auto border border-gray-300 dark:border-slate-700 font-mono text-sm dark:text-slate-200">
        {logs.map((log, i) => (
          <div key={i} className="mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
