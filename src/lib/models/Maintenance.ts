import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMaintenance extends Document {
  vehicleId: string; // Reference to Vehicle
  serviceType: string;
  serviceDate: Date;
  cost: number;
  description: string;
  nextServiceDate: Date;
  vendor: string;
  id: string;
}

const maintenanceSchema = new Schema<IMaintenance>(
  {
    id: { type: String, required: true, unique: true },
    vehicleId: {
      type: String,
      ref: "Vehicle",
      required: true,
    },
    serviceType: { type: String, required: true },
    serviceDate: { type: Date, required: true },
    cost: { type: Number, required: true },
    description: { type: String },
    nextServiceDate: { type: Date },
    vendor: { type: String },
  },
  { timestamps: true },
);

const Maintenance: Model<IMaintenance> =
  mongoose.models.Maintenance ||
  mongoose.model<IMaintenance>("Maintenance", maintenanceSchema);

export default Maintenance;
