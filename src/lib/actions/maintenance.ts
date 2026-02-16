"use server";

import dbConnect from "../db";
import Maintenance, { IMaintenance } from "../models/Maintenance";
import { revalidatePath } from "next/cache";

export async function createMaintenance(data: Partial<IMaintenance>) {
  await dbConnect();
  try {
    const maintenance = await Maintenance.create(data);
    revalidatePath("/maintenance");
    return { success: true, data: JSON.parse(JSON.stringify(maintenance)) };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: message };
  }
}

export async function getMaintenanceRecords() {
  await dbConnect();
  try {
    const records = await Maintenance.find({})
      .populate("vehicle")
      .sort({ createdAt: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(records)) };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: message };
  }
}

export async function getMaintenanceById(id: string) {
  await dbConnect();
  try {
    const maintenance = await Maintenance.findById(id).populate("vehicle");
    if (!maintenance) {
      return { success: false, error: "Maintenance record not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(maintenance)) };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: message };
  }
}

export async function updateMaintenance(
  id: string,
  data: Partial<IMaintenance>,
) {
  await dbConnect();
  try {
    const maintenance = await Maintenance.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!maintenance) {
      return { success: false, error: "Maintenance record not found" };
    }
    revalidatePath("/maintenance");
    revalidatePath(`/maintenance/${id}`);
    return { success: true, data: JSON.parse(JSON.stringify(maintenance)) };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: message };
  }
}

export async function deleteMaintenance(id: string) {
  await dbConnect();
  try {
    const maintenance = await Maintenance.findByIdAndDelete(id);
    if (!maintenance) {
      return { success: false, error: "Maintenance record not found" };
    }
    revalidatePath("/maintenance");
    return {
      success: true,
      message: "Maintenance record deleted successfully",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: message };
  }
}
