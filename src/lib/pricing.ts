import { IVehicle } from "./models/Vehicle";

export interface PricingBreakdown {
  baseRate: number;
  extraKmCharge: number;
  lateReturnCharge: number;
  fuelRefillCharge: number;
  damageCharge: number;
  securityDeposit: number;
  tax: number;
  total: number;
}

export interface CalculationInput {
  vehicle: IVehicle;
  pickupDate: Date;
  dropDate: Date; // Scheduled drop
  actualDropDate?: Date; // Actual drop
  startOdometer?: number;
  endOdometer?: number;
  fuelLevel?: {
    start: number; // 0-100
    end: number; // 0-100
  }; // percentage
  damages?: number;
  securityDeposit?: number;
}

export const FUEL_REFILL_RATE_PER_UNIT = 2; // e.g. $2 per % missing (simplified)
export const TAX_RATE = 0.18; // 18% GST default
export const INCLUDED_KM_PER_DAY = 300; // 300km per day included

export function calculateRentalPrice(
  input: CalculationInput,
): PricingBreakdown {
  const {
    vehicle,
    pickupDate,
    dropDate,
    actualDropDate,
    startOdometer,
    endOdometer,
    fuelLevel,
    damages = 0,
    securityDeposit = 0,
  } = input;

  // 1. Calculate Duration
  // If actualDropDate is present, we use dropDate for base calculation and difference for late fee?
  // Usually base is calculated on agreed time, and late fee is added on top.

  const startTime = new Date(pickupDate).getTime();
  const scheduledEndTime = new Date(dropDate).getTime();
  const actualEndTime = actualDropDate
    ? new Date(actualDropDate).getTime()
    : scheduledEndTime;

  const durationMs = scheduledEndTime - startTime;
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
  const durationDays = Math.ceil(durationHours / 24);
  const durationWeeks = Math.floor(durationDays / 7);
  const remainingDays = durationDays % 7;

  // 2. Base Rate Calculation
  let baseRate = 0;

  // Simple priority: Weekly > Daily > Hourly
  // If weekly rate exists and duration > 1 week
  if (vehicle.rates?.weekly && durationWeeks > 0) {
    baseRate += durationWeeks * vehicle.rates.weekly;
    baseRate += remainingDays * (vehicle.rates.daily || vehicle.pricePerDay);
  } else {
    // Fallback to daily
    baseRate += durationDays * (vehicle.rates?.daily || vehicle.pricePerDay);
  }

  // Hourly logic could be applied if duration is small, e.g. < 24h
  if (durationHours < 24 && vehicle.rates?.hourly) {
    baseRate = durationHours * vehicle.rates.hourly;
  }

  // 3. Late Return
  let lateReturnCharge = 0;
  if (actualEndTime > scheduledEndTime) {
    const lateMs = actualEndTime - scheduledEndTime;
    const lateHours = Math.ceil(lateMs / (1000 * 60 * 60));
    const rate = vehicle.extraCharges?.lateReturnPerHour || 50; // Default 50
    lateReturnCharge = lateHours * rate;
  }

  // 4. Extra Km
  let extraKmCharge = 0;
  if (startOdometer !== undefined && endOdometer !== undefined) {
    const distance = endOdometer - startOdometer;
    const totalIncludedKm = durationDays * INCLUDED_KM_PER_DAY;
    // Can be configurable per vehicle too ideally

    if (distance > totalIncludedKm) {
      const extraKm = distance - totalIncludedKm;
      const rate = vehicle.extraCharges?.extraKm || 10; // Default 10
      extraKmCharge = extraKm * rate;
    }
  }

  // 5. Fuel Refill
  let fuelRefillCharge = 0;
  if (fuelLevel && fuelLevel.start > fuelLevel.end) {
    const diff = fuelLevel.start - fuelLevel.end;
    fuelRefillCharge = diff * FUEL_REFILL_RATE_PER_UNIT;
  }

  // 6. Tax
  const taxableAmount =
    baseRate + extraKmCharge + lateReturnCharge + fuelRefillCharge + damages;
  const tax = taxableAmount * TAX_RATE;

  // 7. Total
  const total = taxableAmount + tax + securityDeposit;

  return {
    baseRate,
    extraKmCharge,
    lateReturnCharge,
    fuelRefillCharge,
    damageCharge: damages,
    securityDeposit,
    tax,
    total,
  };
}
