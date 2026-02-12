
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBooking extends Document {
    customerId: string; // Reference to Customer
    vehicleId: string; // Reference to Vehicle
    pickupDate: Date;
    dropDate: Date;
    status: string;
    totalAmount: number;
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
        status: {
            type: String,
            default: 'Pending',
        },
        totalAmount: { type: Number, required: true },
        notes: { type: String },
    },
    { timestamps: true }
);

const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
