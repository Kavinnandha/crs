"use server";

import dbConnect from "@/lib/db";
import Vehicle from "@/lib/models/Vehicle";
import Customer from "@/lib/models/Customer";
import Maintenance from "@/lib/models/Maintenance";
import Booking from "@/lib/models/Booking";
import Payment from "@/lib/models/Payment";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- Vehicles ---

export async function createVehicle(formData: FormData) {
    await dbConnect();

    const data = {
        id: `v${Date.now()}`, // Simple ID generation
        brand: formData.get("brand") as string,
        model: formData.get("model") as string,
        year: Number(formData.get("year")),
        category: formData.get("category") as string,
        registrationNumber: formData.get("registrationNumber") as string,
        fuelType: formData.get("fuelType") as string,
        transmission: formData.get("transmission") as string,
        status: (formData.get("status") as string) || "Available",
        pricePerDay: Number(formData.get("pricePerDay")),
        color: formData.get("color") as string,
        mileage: Number(formData.get("mileage") || 0),
        imageUrl: "/vehicles/placeholder.jpg",
        createdAt: new Date().toISOString()
    };

    try {
        await Vehicle.create(data);
    } catch (error) {
        console.error("Error creating vehicle:", error);
        throw new Error("Failed to create vehicle");
    }

    revalidatePath("/dashboard/vehicles");
    redirect("/dashboard/vehicles");
}

export async function updateVehicle(id: string, formData: FormData) {
    await dbConnect();

    const data = {
        brand: formData.get("brand") as string,
        model: formData.get("model") as string,
        year: Number(formData.get("year")),
        category: formData.get("category") as string,
        registrationNumber: formData.get("registrationNumber") as string,
        fuelType: formData.get("fuelType") as string,
        transmission: formData.get("transmission") as string,
        status: formData.get("status") as string,
        pricePerDay: Number(formData.get("pricePerDay")),
        color: formData.get("color") as string,
        mileage: Number(formData.get("mileage") || 0),
    };

    try {
        await Vehicle.updateOne({ id }, data);
    } catch (error) {
        console.error("Error updating vehicle:", error);
        throw new Error("Failed to update vehicle");
    }

    revalidatePath("/dashboard/vehicles");
    redirect("/dashboard/vehicles");
}

export async function deleteVehicle(id: string) {
    await dbConnect();

    // Check for constraints
    const bookingCount = await Booking.countDocuments({ vehicleId: id });
    if (bookingCount > 0) {
        throw new Error(`Cannot delete vehicle. Associated with ${bookingCount} bookings.`);
    }

    const maintenanceCount = await Maintenance.countDocuments({ vehicleId: id });
    if (maintenanceCount > 0) {
        throw new Error(`Cannot delete vehicle. Associated with ${maintenanceCount} maintenance records.`);
    }

    try {
        await Vehicle.deleteOne({ id });
        revalidatePath("/dashboard/vehicles");
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        throw new Error("Failed to delete vehicle");
    }
}

// --- Customers ---

export async function createCustomer(formData: FormData) {
    await dbConnect();

    const data = {
        id: `c${Date.now()}`,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        drivingLicenseNumber: formData.get("drivingLicenseNumber") as string,
        verificationStatus: (formData.get("verificationStatus") as string) || "Pending",
        createdAt: new Date().toISOString()
    };

    try {
        await Customer.create(data);
    } catch (error) {
        console.error("Error creating customer:", error);
        throw new Error("Failed to create customer");
    }

    revalidatePath("/dashboard/customers");
    redirect("/dashboard/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
    await dbConnect();

    const data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        drivingLicenseNumber: formData.get("drivingLicenseNumber") as string,
        verificationStatus: formData.get("verificationStatus") as string,
    };

    try {
        await Customer.updateOne({ id }, data);
    } catch (error) {
        console.error("Error updating customer:", error);
        throw new Error("Failed to update customer");
    }

    revalidatePath("/dashboard/customers");
    redirect("/dashboard/customers");
}

export async function deleteCustomer(id: string) {
    await dbConnect();

    const bookingCount = await Booking.countDocuments({ customerId: id });
    if (bookingCount > 0) {
        throw new Error(`Cannot delete customer. Associated with ${bookingCount} bookings.`);
    }

    try {
        await Customer.deleteOne({ id });
        revalidatePath("/dashboard/customers");
    } catch (error) {
        console.error("Error deleting customer:", error);
        throw new Error("Failed to delete customer");
    }
}


// --- Maintenance ---

// --- Maintenance ---

export async function createMaintenance(formData: FormData) {
    await dbConnect();

    const data = {
        id: `m${Date.now()}`,
        vehicleId: formData.get("vehicleId") as string,
        serviceType: formData.get("serviceType") as string,
        serviceDate: new Date(formData.get("serviceDate") as string),
        cost: Number(formData.get("cost")),
        description: formData.get("description") as string,
        nextServiceDate: formData.get("nextServiceDate") ? new Date(formData.get("nextServiceDate") as string) : undefined,
        vendor: formData.get("vendor") as string,
    };

    try {
        await Maintenance.create(data);
    } catch (error) {
        console.error("Error creating maintenance record:", error);
        throw new Error("Failed to create maintenance record");
    }

    revalidatePath("/dashboard/maintenance");
    redirect("/dashboard/maintenance");
}

export async function updateMaintenance(id: string, formData: FormData) {
    await dbConnect();

    const data = {
        vehicleId: formData.get("vehicleId") as string,
        serviceType: formData.get("serviceType") as string,
        serviceDate: new Date(formData.get("serviceDate") as string),
        cost: Number(formData.get("cost")),
        description: formData.get("description") as string,
        nextServiceDate: formData.get("nextServiceDate") ? new Date(formData.get("nextServiceDate") as string) : undefined,
        vendor: formData.get("vendor") as string,
    };

    try {
        await Maintenance.updateOne({ id }, data);
    } catch (error) {
        console.error("Error updating maintenance record:", error);
        throw new Error("Failed to update maintenance record");
    }

    revalidatePath("/dashboard/maintenance");
    redirect("/dashboard/maintenance");
}

export async function deleteMaintenance(id: string) {
    await dbConnect();
    try {
        await Maintenance.deleteOne({ id });
        revalidatePath("/dashboard/maintenance");
    } catch (error) {
        console.error("Error deleting maintenance record:", error);
        throw new Error("Failed to delete maintenance record");
    }
}

// --- Bookings ---

// --- Bookings ---

export async function createBooking(formData: FormData) {
    await dbConnect();

    const data = {
        id: `b${Date.now()}`,
        customerId: formData.get("customerId") as string,
        vehicleId: formData.get("vehicleId") as string,
        pickupDate: new Date(formData.get("pickupDate") as string),
        dropDate: new Date(formData.get("dropDate") as string),
        status: (formData.get("status") as string) || "Active",
        totalAmount: Number(formData.get("totalAmount")),
        notes: formData.get("notes") as string,
        createdAt: new Date().toISOString()
    };

    try {
        await Booking.create(data);
    } catch (error) {
        console.error("Error creating booking:", error);
        throw new Error("Failed to create booking");
    }

    revalidatePath("/dashboard/bookings");
    redirect("/dashboard/bookings");
}

export async function updateBooking(id: string, formData: FormData) {
    await dbConnect();

    const data = {
        customerId: formData.get("customerId") as string,
        vehicleId: formData.get("vehicleId") as string,
        pickupDate: new Date(formData.get("pickupDate") as string),
        dropDate: new Date(formData.get("dropDate") as string),
        status: formData.get("status") as string,
        totalAmount: Number(formData.get("totalAmount")),
        notes: formData.get("notes") as string,
    };

    try {
        await Booking.updateOne({ id }, data);
    } catch (error) {
        console.error("Error updating booking:", error);
        throw new Error("Failed to update booking");
    }

    revalidatePath("/dashboard/bookings");
    redirect("/dashboard/bookings");
}

export async function deleteBooking(id: string) {
    await dbConnect();
    try {
        // Cascade delete payments
        await Payment.deleteMany({ bookingId: id });

        await Booking.deleteOne({ id });
        revalidatePath("/dashboard/bookings");
    } catch (error) {
        console.error("Error deleting booking:", error);
        throw new Error("Failed to delete booking");
    }
}

// --- Payments ---

// --- Payments ---

export async function createPayment(formData: FormData) {
    await dbConnect();

    const data = {
        id: `p${Date.now()}`,
        bookingId: formData.get("bookingId") as string,
        amount: Number(formData.get("amount")),
        mode: formData.get("mode") as string,
        status: (formData.get("status") as string) || "Pending",
        paidAt: formData.get("paidAt") ? new Date(formData.get("paidAt") as string) : undefined,
        transactionId: formData.get("transactionId") as string,
    };

    try {
        await Payment.create(data);
    } catch (error) {
        console.error("Error creating payment:", error);
        throw new Error("Failed to create payment");
    }

    revalidatePath("/dashboard/payments");
    redirect("/dashboard/payments");
}

export async function updatePayment(id: string, formData: FormData) {
    await dbConnect();

    const data = {
        bookingId: formData.get("bookingId") as string,
        amount: Number(formData.get("amount")),
        mode: formData.get("mode") as string,
        status: formData.get("status") as string,
        paidAt: formData.get("paidAt") ? new Date(formData.get("paidAt") as string) : undefined,
        transactionId: formData.get("transactionId") as string,
    };

    try {
        await Payment.updateOne({ id }, data);
    } catch (error) {
        console.error("Error updating payment:", error);
        throw new Error("Failed to update payment");
    }

    revalidatePath("/dashboard/payments");
    redirect("/dashboard/payments");
}

export async function deletePayment(id: string) {
    await dbConnect();
    try {
        await Payment.deleteOne({ id });
        revalidatePath("/dashboard/payments");
    } catch (error) {
        console.error("Error deleting payment:", error);
        throw new Error("Failed to delete payment");
    }
}
