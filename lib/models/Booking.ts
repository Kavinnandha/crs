
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBooking extends Document {
    customer: mongoose.Types.ObjectId;
    vehicle: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
    {
        customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
        vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        totalPrice: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
