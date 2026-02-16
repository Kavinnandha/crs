import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  VehicleStatus,
  BookingStatus,
  PaymentStatus,
  VerificationStatus,
} from "@/types";

const vehicleStatusStyles: Record<VehicleStatus, string> = {
  Available:
    "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 dark:border-emerald-800",
  Rented:
    "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800",
  Maintenance:
    "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800",
};

const bookingStatusStyles: Record<BookingStatus, string> = {
  Reserved:
    "bg-violet-50 dark:bg-violet-950/30 text-violet-600 border-violet-200 dark:border-violet-800",
  Active:
    "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800",
  Completed:
    "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 dark:border-emerald-800",
  Cancelled:
    "bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200 dark:border-red-800",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  Paid: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 dark:border-emerald-800",
  Partial:
    "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800",
  Pending:
    "bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200 dark:border-red-800",
};

const verificationStatusStyles: Record<VerificationStatus, string> = {
  Verified:
    "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 dark:border-emerald-800",
  Pending:
    "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800",
  Rejected:
    "bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200 dark:border-red-800",
};

interface StatusBadgeProps {
  status: string;
  variant: "vehicle" | "booking" | "payment" | "verification";
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  let styles = "";

  switch (variant) {
    case "vehicle":
      styles = vehicleStatusStyles[status as VehicleStatus] || "";
      break;
    case "booking":
      styles = bookingStatusStyles[status as BookingStatus] || "";
      break;
    case "payment":
      styles = paymentStatusStyles[status as PaymentStatus] || "";
      break;
    case "verification":
      styles = verificationStatusStyles[status as VerificationStatus] || "";
      break;
  }

  return (
    <Badge variant="outline" className={cn("font-medium text-[11px]", styles)}>
      {status}
    </Badge>
  );
}
