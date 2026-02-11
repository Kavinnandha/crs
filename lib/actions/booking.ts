
'use server';

import dbConnect from '../db';
import Booking, { IBooking } from '../models/Booking';
import { revalidatePath } from 'next/cache';

export async function createBooking(data: Partial<IBooking>) {
    await dbConnect();
    try {
        const booking = await Booking.create(data);
        revalidatePath('/bookings');
        return { success: true, data: JSON.parse(JSON.stringify(booking)) };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        return { success: false, error: message };
    }
}

export async function getBookings() {
    await dbConnect();
    try {
        const bookings = await Booking.find({})
            .populate('customer')
            .populate('vehicle')
            .sort({ createdAt: -1 });
        return { success: true, data: JSON.parse(JSON.stringify(bookings)) };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        return { success: false, error: message };
    }
}

export async function getBookingById(id: string) {
    await dbConnect();
    try {
        const booking = await Booking.findById(id)
            .populate('customer')
            .populate('vehicle');
        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }
        return { success: true, data: JSON.parse(JSON.stringify(booking)) };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        return { success: false, error: message };
    }
}

export async function updateBooking(id: string, data: Partial<IBooking>) {
    await dbConnect();
    try {
        const booking = await Booking.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }
        revalidatePath('/bookings');
        revalidatePath(`/bookings/${id}`);
        return { success: true, data: JSON.parse(JSON.stringify(booking)) };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        return { success: false, error: message };
    }
}

export async function deleteBooking(id: string) {
    await dbConnect();
    try {
        const booking = await Booking.findByIdAndDelete(id);
        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }
        revalidatePath('/bookings');
        return { success: true, message: 'Booking deleted successfully' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        return { success: false, error: message };
    }
}
