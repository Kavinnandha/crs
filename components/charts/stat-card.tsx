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
        <Card className={cn("relative overflow-hidden", className)}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold tracking-tight">{value}</p>
                        {(description || trend) && (
                            <div className="flex items-center gap-2">
                                {trend && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md",
                                            trend.positive
                                                ? "bg-emerald-500/10 text-emerald-600"
                                                : "bg-red-500/10 text-red-600"
                                        )}
                                    >
                                        {trend.positive ? "+" : ""}
                                        {trend.value}%
                                    </span>
                                )}
                                {description && (
                                    <p className="text-xs text-muted-foreground">{description}</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
