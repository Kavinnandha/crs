
'use server';

import dbConnect from '../db';
import Payment, { IPayment } from '../models/Payment';
import { revalidatePath } from 'next/cache';

export async function createPayment(data: Partial<IPayment>) {
    await dbConnect();
    try {
        const payment = await Payment.create(data);
        revalidatePath('/payments');
        return { success: true, data: JSON.parse(JSON.stringify(payment)) };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        return { success: false, error: message };
    }
}

export async function getPayments() {
    await dbConnect();
    try {
        const payments = await Payment.find({})
            .populate({
                path: 'booking',
                populate: [
                    { path: 'customer' },
                    { path: 'vehicle' }
                ]
            })
            .sort({ createdAt: -1 });
        return { success: true, data: JSON.parse(JSON.stringify(payments)) };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        return { success: false, error: message };
    }
}

export async function getPaymentById(id: string) {
    await dbConnect();
    try {
        const payment = await Payment.findById(id)
            .populate({
                path: 'booking',
                populate: [
                    { path: 'customer' },
                    { path: 'vehicle' }
                ]
            });
        if (!payment) {
            return { success: false, error: 'Payment not found' };
        }
        return { success: true, data: JSON.parse(JSON.stringify(payment)) };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        return { success: false, error: message };
    }
}

export async function updatePayment(id: string, data: Partial<IPayment>) {
    await dbConnect();
    try {
        const payment = await Payment.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!payment) {
            return { success: false, error: 'Payment not found' };
        }
        revalidatePath('/payments');
        revalidatePath(`/payments/${id}`);
        return { success: true, data: JSON.parse(JSON.stringify(payment)) };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        return { success: false, error: message };
    }
}

export async function deletePayment(id: string) {
    await dbConnect();
    try {
        const payment = await Payment.findByIdAndDelete(id);
        if (!payment) {
            return { success: false, error: 'Payment not found' };
        }
        revalidatePath('/payments');
        return { success: true, message: 'Payment deleted successfully' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        return { success: false, error: message };
    }
}
