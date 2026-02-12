
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    phone: string;
    email: string;
    drivingLicenseNumber: string;
    verificationStatus: string;
    address: string;
    id: string;
}

const customerSchema = new Schema<ICustomer>(
    {
        id: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        drivingLicenseNumber: { type: String, required: true },
        verificationStatus: { type: String, default: 'Pending' },
        address: { type: String },
    },
    { timestamps: true }
);

const Customer: Model<ICustomer> =
    mongoose.models.Customer ||
    mongoose.model<ICustomer>('Customer', customerSchema);

export default Customer;
