
'use server';

import dbConnect from '../db';
import Vehicle, { IVehicle } from '../models/Vehicle';
import { revalidatePath } from 'next/cache';

export async function createVehicle(data: Partial<IVehicle>) {
    await dbConnect();
    try {
        const vehicle = await Vehicle.create(data);
        revalidatePath('/vehicles');
        return { success: true, data: JSON.parse(JSON.stringify(vehicle)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getVehicles() {
    await dbConnect();
    try {
        const vehicles = await Vehicle.find({}).sort({ createdAt: -1 });
        return { success: true, data: JSON.parse(JSON.stringify(vehicles)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getVehicleById(id: string) {
    await dbConnect();
    try {
        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return { success: false, error: 'Vehicle not found' };
        }
        return { success: true, data: JSON.parse(JSON.stringify(vehicle)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateVehicle(id: string, data: Partial<IVehicle>) {
    await dbConnect();
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!vehicle) {
            return { success: false, error: 'Vehicle not found' };
        }
        revalidatePath('/vehicles');
        revalidatePath(`/vehicles/${id}`);
        return { success: true, data: JSON.parse(JSON.stringify(vehicle)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteVehicle(id: string) {
    await dbConnect();
    try {
        const vehicle = await Vehicle.findByIdAndDelete(id);
        if (!vehicle) {
            return { success: false, error: 'Vehicle not found' };
        }
        revalidatePath('/vehicles');
        return { success: true, message: 'Vehicle deleted successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
