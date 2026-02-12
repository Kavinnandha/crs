import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    VehicleStatus, BookingStatus, PaymentStatus, VerificationStatus,
} from "@/types";

const vehicleStatusStyles: Record<VehicleStatus, string> = {
    Available: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Rented: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    Maintenance: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const bookingStatusStyles: Record<BookingStatus, string> = {
    Reserved: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    Active: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
    Paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Partial: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Pending: "bg-red-500/10 text-red-600 border-red-500/20",
};

const verificationStatusStyles: Record<VerificationStatus, string> = {
    Verified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Rejected: "bg-red-500/10 text-red-600 border-red-500/20",
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
            className={cn("font-medium", styles)}
        >
            {status}
        </Badge>
    );
}
