import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    VehicleStatus, BookingStatus, PaymentStatus, VerificationStatus,
} from "@/types";

const vehicleStatusStyles: Record<VehicleStatus, string> = {
    Available: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Rented: "bg-blue-50 text-blue-600 border-blue-200",
    Maintenance: "bg-amber-50 text-amber-600 border-amber-200",
};

const bookingStatusStyles: Record<BookingStatus, string> = {
    Reserved: "bg-violet-50 text-violet-600 border-violet-200",
    Active: "bg-blue-50 text-blue-600 border-blue-200",
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Cancelled: "bg-red-50 text-red-600 border-red-200",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
    Paid: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Partial: "bg-amber-50 text-amber-600 border-amber-200",
    Pending: "bg-red-50 text-red-600 border-red-200",
};

const verificationStatusStyles: Record<VerificationStatus, string> = {
    Verified: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Pending: "bg-amber-50 text-amber-600 border-amber-200",
    Rejected: "bg-red-50 text-red-600 border-red-200",
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
        <Badge
            variant="outline"
            className={cn("font-medium text-[11px]", styles)}
        >
            {status}
        </Badge>
    );
}
