
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IVehicle extends Omit<Document, 'model'> {
    brand: string;
    model: string;
    year: number;
    category: string;
    registrationNumber: string;
    fuelType: string;
    transmission: string;
    status: string;
    pricePerDay: number;
    imageUrl: string;
    mileage: number;
    color: string;
    id: string; // Custom ID from mock data
    createdAt: Date;
    updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
    {
        id: { type: String, required: true, unique: true },
        brand: { type: String, required: true },
        model: { type: String, required: true },
        year: { type: Number, required: true },
        category: { type: String, required: true },
        registrationNumber: { type: String, required: true, unique: true },
        status: {
            type: String,
            default: 'Available',
        },
        fuelType: { type: String, required: true },
        transmission: { type: String, required: true },
        pricePerDay: { type: Number, required: true },
        imageUrl: { type: String },
        mileage: { type: Number },
        color: { type: String },
    },
    { timestamps: true }
);

// Prevent overwriting model if already compiled
const Vehicle: Model<IVehicle> =
    mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', vehicleSchema);

export default Vehicle;
