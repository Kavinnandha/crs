
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPayment extends Document {
    bookingId: string; // Reference to Booking
    amount: number;
    mode: string;
    status: string;
    paidAt: Date;
    transactionId: string;
    id: string;
}

const paymentSchema = new Schema<IPayment>(
    {
        id: { type: String, required: true, unique: true },
        bookingId: {
            type: String,
            ref: 'Booking',
            required: true,
        },
        amount: { type: Number, required: true },
        mode: { type: String },
        status: { type: String, default: 'Pending' },
        paidAt: { type: Date },
        transactionId: { type: String },
    },
    { timestamps: true }
);

const Payment: Model<IPayment> =
    mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
