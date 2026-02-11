"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Car, Users, CalendarDays, CreditCard,
    Wrench, BarChart3, Settings, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
    { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/vehicles", label: "Vehicles", icon: Car },
    { href: "/dashboard/customers", label: "Customers", icon: Users },
    { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300",
                collapsed ? "w-[68px]" : "w-[260px]"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
                {!collapsed && (
                    <Link href="/dashboard/overview" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Car className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">SpeedWheels</span>
                    </Link>
                )}
                {collapsed && (
                    <Link href="/dashboard/overview" className="mx-auto">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Car className="h-4 w-4 text-primary-foreground" />
                        </div>
                    </Link>
                )}
            </div>

            {/* Nav */}
            <ScrollArea className="h-[calc(100vh-8rem)]">
                <nav className="flex flex-col gap-1 p-3">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard/overview" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        if (collapsed) {
                            return (
                                <Tooltip key={item.href} delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-lg mx-auto transition-colors",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={8}>
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>

            {/* Toggle */}
            <div className="absolute bottom-0 w-full border-t border-border p-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className={cn("w-full", collapsed && "px-0")}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Collapse
                        </>
                    )}
                </Button>
            </div>
        </aside>
    );
}
