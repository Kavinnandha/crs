
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IVehicle extends Document {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    status: 'available' | 'rented' | 'maintenance';
    dailyRate: number;
    fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    transmission: 'automatic' | 'manual';
    features: string[];
    images: string[];
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
    {
        make: { type: String, required: true },
        model: { type: String, required: true },
        year: { type: Number, required: true },
        licensePlate: { type: String, required: true, unique: true },
        status: {
            type: String,
            enum: ['available', 'rented', 'maintenance'],
            default: 'available',
        },
        dailyRate: { type: Number, required: true },
        fuelType: {
            type: String,
            enum: ['petrol', 'diesel', 'electric', 'hybrid'],
            required: true,
        },
        transmission: {
            type: String,
            enum: ['automatic', 'manual'],
            required: true,
        },
        features: { type: [String], default: [] },
        images: { type: [String], default: [] },
        description: { type: String },
    },
    { timestamps: true }
);

const Vehicle: Model<IVehicle> =
    mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', vehicleSchema);

export default Vehicle;
