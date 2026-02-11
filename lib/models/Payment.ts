
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPayment extends Document {
    booking: mongoose.Types.ObjectId;
    amount: number;
    mode: 'Cash' | 'UPI' | 'Card';
    status: 'Paid' | 'Partial' | 'Pending';
    transactionId: string;
    paidAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
    {
        booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
        amount: { type: Number, required: true },
        mode: {
            type: String,
            enum: ['Cash', 'UPI', 'Card'],
            required: true,
        },
        status: {
            type: String,
            enum: ['Paid', 'Partial', 'Pending'],
            default: 'Pending',
        },
        transactionId: { type: String, required: true, unique: true },
        paidAt: { type: Date, required: true },
    },
    { timestamps: true }
);

const Payment: Model<IPayment> =
    mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
