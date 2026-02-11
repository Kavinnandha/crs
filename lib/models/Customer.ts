
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    email: string;
    phone?: string;
    driverLicense?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String },
        driverLicense: { type: String, unique: true, sparse: true },
        address: { type: String },
    },
    { timestamps: true }
);

const Customer: Model<ICustomer> =
    mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);

export default Customer;
