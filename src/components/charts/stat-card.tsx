import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        positive: boolean;
    };
    className?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
}: StatCardProps) {
    return (
        <Card className={cn("relative overflow-hidden bg-white border-[#E8E5F0] shadow-sm hover:shadow-md transition-shadow duration-200", className)}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-[#94a3b8] uppercase tracking-wide">{title}</p>
                        <p className="text-2xl font-semibold text-[#1a1d2e] tracking-tight">{value}</p>
                        {(description || trend) && (
                            <div className="flex items-center gap-2">
                                {trend && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-md",
                                            trend.positive
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-red-50 text-red-600"
                                        )}
                                    >
                                        {trend.positive ? "+" : ""}
                                        {trend.value}%
                                    </span>
                                )}
                                {description && (
                                    <p className="text-[11px] text-[#94a3b8]">{description}</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5F3FF]">
                        <Icon className="h-5 w-5 text-[#7C3AED]" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
