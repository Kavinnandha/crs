// ==========================================
// Car Rental System - Core Types
// ==========================================

// Vehicle Types
export type VehicleCategory = "Hatchback" | "Sedan" | "SUV" | "Luxury";
export type FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid";
export type TransmissionType = "Manual" | "Automatic";
export type VehicleStatus = "Available" | "Rented" | "Maintenance";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  registrationNumber: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  status: VehicleStatus;
  pricePerDay: number;
  rates?: {
    hourly: number;
    daily: number;
    weekly: number;
  };
  extraCharges?: {
    lateReturnPerHour: number;
    extraKm: number;
  };
  imageUrl: string;
  mileage: number;
  color: string;
  createdAt: string;
}

// Customer Types
export type VerificationStatus = "Verified" | "Pending" | "Rejected";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  drivingLicenseNumber: string;
  verificationStatus: VerificationStatus;
  address: string;
  createdAt: string;
}

// Booking Types
export type BookingStatus = "Reserved" | "Active" | "Completed" | "Cancelled";

export interface Booking {
  id: string;
  customerId: string;
  vehicleId: string;
  pickupDate: string;
  dropDate: string;
  actualDropDate?: string;
  status: BookingStatus;
  totalAmount: number;

  // Usage
  startOdometer?: number;
  endOdometer?: number;
  fuelLevel?: {
    start: number;
    end: number;
  };

  // Charges
  charges?: {
    base: number;
    extraKm: number;
    lateReturn: number;
    fuelRefill: number;
    damage: number;
    securityDeposit: number;
    tax: number;
    total: number;
  };

  createdAt: string;
  notes: string;
}

// Payment Types
export type PaymentMode = "Cash" | "UPI" | "Card";
export type PaymentStatus = "Paid" | "Partial" | "Pending";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  mode: PaymentMode;
  status: PaymentStatus;
  paidAt: string;
  transactionId: string;
}

// Maintenance Types
export type ServiceType =
  | "Oil Change"
  | "Tire Replacement"
  | "Brake Service"
  | "Engine Repair"
  | "AC Service"
  | "General Service"
  | "Body Repair"
  | "Battery Replacement";

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  serviceType: ServiceType;
  serviceDate: string;
  cost: number;
  description: string;
  nextServiceDate: string;
  vendor: string;
}

// Settings
export interface BusinessSettings {
  businessName: string;
  gstPercentage: number;
  currency: string;
  rentalRules: string;
  cancellationPolicy: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

// Dashboard
export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  activeRentals: number;
  monthlyRevenue: number;
  pendingPayments: number;
  totalCustomers: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

export interface VehicleUtilization {
  category: string;
  utilized: number;
  idle: number;
}
