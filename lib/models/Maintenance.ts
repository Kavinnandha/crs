
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMaintenance extends Document {
    vehicle: mongoose.Types.ObjectId;
    serviceType: 'Oil Change' | 'Tire Replacement' | 'Brake Service' | 'Engine Repair' | 'AC Service' | 'General Service' | 'Body Repair' | 'Battery Replacement';
    serviceDate: Date;
    cost: number;
    description: string;
    nextServiceDate: Date;
    vendor: string;
    createdAt: Date;
    updatedAt: Date;
}

const maintenanceSchema = new Schema<IMaintenance>(
    {
        vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
        serviceType: {
            type: String,
            enum: ['Oil Change', 'Tire Replacement', 'Brake Service', 'Engine Repair', 'AC Service', 'General Service', 'Body Repair', 'Battery Replacement'],
            required: true,
        },
        serviceDate: { type: Date, required: true },
        cost: { type: Number, required: true },
        description: { type: String, required: true },
        nextServiceDate: { type: Date, required: true },
        vendor: { type: String, required: true },
    },
    { timestamps: true }
);

const Maintenance: Model<IMaintenance> =
    mongoose.models.Maintenance || mongoose.model<IMaintenance>('Maintenance', maintenanceSchema);

export default Maintenance;
