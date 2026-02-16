"use server";

import dbConnect from "../db";
import Customer, { ICustomer } from "../models/Customer";
import { revalidatePath } from "next/cache";

export async function createCustomer(data: Partial<ICustomer>) {
  await dbConnect();
  try {
    const customer = await Customer.create(data);
    revalidatePath("/customers");
    return { success: true, data: JSON.parse(JSON.stringify(customer)) };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: message };
  }
}

export async function getCustomers() {
  await dbConnect();
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(customers)) };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: message };
  }
}

export async function getCustomerById(id: string) {
  await dbConnect();
  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return { success: false, error: "Customer not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(customer)) };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: message };
  }
}

export async function updateCustomer(id: string, data: Partial<ICustomer>) {
  await dbConnect();
  try {
    const customer = await Customer.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!customer) {
      return { success: false, error: "Customer not found" };
    }
    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    return { success: true, data: JSON.parse(JSON.stringify(customer)) };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: message };
  }
}

export async function deleteCustomer(id: string) {
  await dbConnect();
  try {
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return { success: false, error: "Customer not found" };
    }
    revalidatePath("/customers");
    return { success: true, message: "Customer deleted successfully" };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: message };
  }
}
