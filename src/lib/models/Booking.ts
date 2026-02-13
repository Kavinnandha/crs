
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBooking extends Document {
    customerId: string; // Reference to Customer
    vehicleId: string; // Reference to Vehicle
    pickupDate: Date;
    dropDate: Date;
    actualDropDate?: Date;
    status: string;
    totalAmount: number; // Final calculated amount

    // Usage Details
    startOdometer?: number;
    endOdometer?: number;
    fuelLevel?: {
        start: number; // percentage
        end: number;
    };

    // Charge Breakdown
    charges?: {
        base: number;
        extraKm: number;
        lateReturn: number;
        fuelRefill: number;
        damage: number;
        securityDeposit: number;
        tax: number;
        total: number;
    };

    notes: string;
    id: string;
}

const bookingSchema = new Schema<IBooking>(
    {
        id: { type: String, required: true, unique: true },
        customerId: {
            type: String,
            ref: 'Customer',
            required: true,
        },
        vehicleId: {
            type: String,
            ref: 'Vehicle',
            required: true,
        },
        pickupDate: { type: Date, required: true },
        dropDate: { type: Date, required: true },
        actualDropDate: { type: Date },
        status: {
            type: String,
            default: 'Pending',
        },
        totalAmount: { type: Number, required: true },

        startOdometer: { type: Number },
        endOdometer: { type: Number },
        fuelLevel: {
            start: { type: Number },
            end: { type: Number },
        },

        charges: {
            base: { type: Number },
            extraKm: { type: Number },
            lateReturn: { type: Number },
            fuelRefill: { type: Number },
            damage: { type: Number },
            securityDeposit: { type: Number },
            tax: { type: Number },
            total: { type: Number },
        },

        notes: { type: String },
    },
    { timestamps: true }
);

const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
