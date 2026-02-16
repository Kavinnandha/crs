"use server";

import dbConnect from "@/lib/db";
import Vehicle from "@/lib/models/Vehicle";
import Customer from "@/lib/models/Customer";
import Maintenance from "@/lib/models/Maintenance";
import Booking from "@/lib/models/Booking";
import Payment from "@/lib/models/Payment";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteFromCloudinary } from "@/lib/cloudinary";

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
        return {
            success: false,
            message: `Cannot delete vehicle. Associated with ${bookingCount} bookings.`,
            dependencyDetails: {
                associatedBookings: bookingCount
            }
        };
    }

    const maintenanceCount = await Maintenance.countDocuments({ vehicleId: id });
    if (maintenanceCount > 0) {
        return {
            success: false,
            message: `Cannot delete vehicle. Associated with ${maintenanceCount} maintenance records.`,
            dependencyDetails: {
                associatedMaintenance: maintenanceCount
            }
        };
    }

    try {
        await Vehicle.deleteOne({ id });
        revalidatePath("/dashboard/vehicles");
        return { success: true, message: "Vehicle deleted successfully" };
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        return { success: false, message: "Failed to delete vehicle" };
    }
}

// --- Customers ---

export async function createCustomer(formData: FormData) {
    await dbConnect();

    const data: Record<string, unknown> = {
        id: `c${Date.now()}`,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        drivingLicenseNumber: formData.get("drivingLicenseNumber") as string,
        verificationStatus: (formData.get("verificationStatus") as string) || "Pending",
        createdAt: new Date().toISOString()
    };

    // Image fields
    const aadharUrl = formData.get("aadharImageUrl") as string;
    const aadharPublicId = formData.get("aadharImagePublicId") as string;
    const licenseUrl = formData.get("drivingLicenseImageUrl") as string;
    const licensePublicId = formData.get("drivingLicenseImagePublicId") as string;

    if (aadharUrl) {
        data.aadharImageUrl = aadharUrl;
        data.aadharImagePublicId = aadharPublicId;
    }
    if (licenseUrl) {
        data.drivingLicenseImageUrl = licenseUrl;
        data.drivingLicenseImagePublicId = licensePublicId;
    }

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

    const data: Record<string, unknown> = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        drivingLicenseNumber: formData.get("drivingLicenseNumber") as string,
        verificationStatus: formData.get("verificationStatus") as string,
    };

    // Handle image fields
    const aadharUrl = formData.get("aadharImageUrl") as string;
    const aadharPublicId = formData.get("aadharImagePublicId") as string;
    const licenseUrl = formData.get("drivingLicenseImageUrl") as string;
    const licensePublicId = formData.get("drivingLicenseImagePublicId") as string;

    // Get existing customer to check for old images to clean up
    const existingCustomer = await Customer.findOne({ id });

    // Update aadhar image fields
    if (aadharUrl) {
        // If there's a new image and old one exists with different publicId, delete old
        if (existingCustomer?.aadharImagePublicId && existingCustomer.aadharImagePublicId !== aadharPublicId) {
            await deleteFromCloudinary(existingCustomer.aadharImagePublicId);
        }
        data.aadharImageUrl = aadharUrl;
        data.aadharImagePublicId = aadharPublicId;
    } else {
        // Image was removed
        if (existingCustomer?.aadharImagePublicId) {
            await deleteFromCloudinary(existingCustomer.aadharImagePublicId);
        }
        data.aadharImageUrl = "";
        data.aadharImagePublicId = "";
    }

    // Update driving license image fields
    if (licenseUrl) {
        if (existingCustomer?.drivingLicenseImagePublicId && existingCustomer.drivingLicenseImagePublicId !== licensePublicId) {
            await deleteFromCloudinary(existingCustomer.drivingLicenseImagePublicId);
        }
        data.drivingLicenseImageUrl = licenseUrl;
        data.drivingLicenseImagePublicId = licensePublicId;
    } else {
        if (existingCustomer?.drivingLicenseImagePublicId) {
            await deleteFromCloudinary(existingCustomer.drivingLicenseImagePublicId);
        }
        data.drivingLicenseImageUrl = "";
        data.drivingLicenseImagePublicId = "";
    }

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
        return {
            success: false,
            message: `Cannot delete customer. Associated with ${bookingCount} bookings.`,
            dependencyDetails: {
                associatedBookings: bookingCount
            }
        };
    }

    try {
        // Find customer to get image public IDs before deletion
        const customer = await Customer.findOne({ id });

        // Delete images from Cloudinary
        if (customer?.aadharImagePublicId) {
            await deleteFromCloudinary(customer.aadharImagePublicId);
        }
        if (customer?.drivingLicenseImagePublicId) {
            await deleteFromCloudinary(customer.drivingLicenseImagePublicId);
        }

        await Customer.deleteOne({ id });
        revalidatePath("/dashboard/customers");
        return { success: true, message: "Customer deleted successfully" };
    } catch (error) {
        console.error("Error deleting customer:", error);
        return { success: false, message: "Failed to delete customer" };
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
        return { success: true, message: "Maintenance record deleted successfully" };
    } catch (error) {
        console.error("Error deleting maintenance record:", error);
        return { success: false, message: "Failed to delete maintenance record" };
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
        return { success: true, message: "Booking and associated payments deleted successfully" };
    } catch (error) {
        console.error("Error deleting booking:", error);
        return { success: false, message: "Failed to delete booking" };
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
        return { success: true, message: "Payment deleted successfully" };
    } catch (error) {
        console.error("Error deleting payment:", error);
        return { success: false, message: "Failed to delete payment" };
    }
}
