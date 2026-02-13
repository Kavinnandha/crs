"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Car, Users, CalendarDays, CreditCard,
    Wrench, BarChart3, Settings,
    LogOut, HelpCircle, Sun, Moon
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const mainNavItems = [
    { href: "/dashboard/overview", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/vehicles", label: "Vehicles", icon: Car },
    { href: "/dashboard/customers", label: "Customers", icon: Users },
    { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
];

const bottomNavItems: any[] = [];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, setMobileOpen }: SidebarProps) {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // On mobile, the sidebar is always "expanded" when open.
    // The "collapsed" prop only applies to desktop view or when mobile menu is closed (which doesn't matter as it is hidden).
    const isSidebarCollapsed = collapsed && !mobileOpen;

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen bg-[#F8F9FC] dark:bg-slate-950 transition-all duration-300 flex flex-col md:border-none",
                // Mobile behavior
                !mobileOpen ? "-translate-x-full" : "translate-x-0 w-[280px]",
                // Desktop behavior
                "md:translate-x-0",
                collapsed ? "md:w-[68px]" : "md:w-[220px]"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center w-full">
                <Link
                    href="/dashboard/overview"
                    className={cn(
                        "flex items-center gap-3 transition-all duration-300 w-full",
                        isSidebarCollapsed ? "pl-[18px]" : "pl-5"
                    )}
                >
                    <div className="relative flex h-10 w-10 items-center justify-center shrink-0 overflow-hidden rounded-full">
                        <img
                            src="/carzio.jpg"
                            alt="Carzio"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <span
                        className={cn(
                            "text-lg font-semibold text-[#1a1d2e] dark:text-white tracking-tight overflow-hidden transition-all duration-300 whitespace-nowrap",
                            isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        )}
                    >
                        Carzio
                    </span>
                </Link>
            </div>

            {/* Main Nav */}
            <ScrollArea className="flex-1 py-5">
                <nav className="flex flex-col gap-1">
                    {mainNavItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard/overview" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Tooltip key={item.href} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            "flex h-10 items-center gap-3 rounded-xl transition-all duration-300 group relative",
                                            isSidebarCollapsed ? "w-10 mx-[14px] justify-center px-0" : "w-[calc(100%-24px)] mx-3 px-3 justify-start",
                                            isActive
                                                ? "bg-[#F5F3FF] text-[#7C3AED] dark:bg-slate-800 dark:text-[#A78BFA]"
                                                : "text-[#64748B] hover:bg-white hover:text-[#1a1d2e] dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                        )}
                                    >
                                        <Icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-300" strokeWidth={isActive ? 2 : 1.5} />
                                        <span
                                            className={cn(
                                                "text-[13px] font-medium overflow-hidden transition-all duration-300 whitespace-nowrap",
                                                isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                    </Link>
                                </TooltipTrigger>
                                {isSidebarCollapsed && (
                                    <TooltipContent side="right" sideOffset={8}>
                                        {item.label}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        );
                    })}
                </nav>
            </ScrollArea>

            {/* Bottom Nav */}
            <div className="pb-2 pt-3">
                <nav className="flex flex-col gap-1 mb-3">
                    {bottomNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Tooltip key={item.label} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            "flex h-10 items-center gap-3 rounded-xl transition-all duration-300",
                                            isSidebarCollapsed ? "w-10 mx-[14px] justify-center px-0" : "w-[calc(100%-24px)] mx-3 px-3 justify-start",
                                            isActive
                                                ? "bg-[#F5F3FF] text-[#7C3AED] dark:bg-slate-800 dark:text-[#A78BFA]"
                                                : "text-[#64748B] hover:bg-white hover:text-[#1a1d2e] dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                        )}
                                    >
                                        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                                        <span
                                            className={cn(
                                                "text-[13px] font-medium overflow-hidden transition-all duration-300 whitespace-nowrap",
                                                isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                    </Link>
                                </TooltipTrigger>
                                {isSidebarCollapsed && (
                                    <TooltipContent side="right" sideOffset={8}>
                                        {item.label}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        );
                    })}

                    {/* Theme Switcher */}
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <button
                                onClick={toggleTheme}
                                className={cn(
                                    "flex h-10 items-center gap-3 rounded-xl transition-all duration-300",
                                    isSidebarCollapsed ? "w-10 mx-[14px] justify-center px-0" : "w-[calc(100%-24px)] mx-3 px-3 justify-start",
                                    "text-[#64748B] hover:bg-white hover:text-[#1a1d2e] dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                )}
                            >
                                <div className="relative h-[18px] w-[18px] shrink-0">
                                    <Sun className="absolute h-full w-full rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" strokeWidth={1.5} />
                                    <Moon className="absolute h-full w-full rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" strokeWidth={1.5} />
                                </div>
                                <span
                                    className={cn(
                                        "text-[13px] font-medium overflow-hidden transition-all duration-300 whitespace-nowrap",
                                        isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                                    )}
                                >
                                    {mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                </span>
                            </button>
                        </TooltipTrigger>
                        {isSidebarCollapsed && (
                            <TooltipContent side="right" sideOffset={8}>
                                Theme
                            </TooltipContent>
                        )}
                    </Tooltip>

                    {/* Logout */}
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <button
                                className={cn(
                                    "flex h-10 items-center gap-3 rounded-xl transition-all duration-300",
                                    isSidebarCollapsed ? "w-10 mx-[14px] justify-center px-0" : "w-[calc(100%-24px)] mx-3 px-3 justify-start",
                                    "text-[#64748B] hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-950/20"
                                )}
                            >
                                <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                                <span
                                    className={cn(
                                        "text-[13px] font-medium overflow-hidden transition-all duration-300 whitespace-nowrap",
                                        isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                                    )}
                                >
                                    Log out
                                </span>
                            </button>
                        </TooltipTrigger>
                        {isSidebarCollapsed && (
                            <TooltipContent side="right" sideOffset={8}>
                                Log out
                            </TooltipContent>
                        )}
                    </Tooltip>
                </nav>
            </div>

            {/* User Profile */}
            <div className="p-3 border-t border-[#E8E5F0] dark:border-slate-800">
                <div
                    className={cn(
                        "flex items-center gap-3 transition-all duration-300",
                        isSidebarCollapsed ? "justify-center" : "px-2 py-2"
                    )}
                >
                    <Avatar className="h-9 w-9 shrink-0 ring-2 ring-[#F5F3FF] dark:ring-slate-800">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback className="bg-[#F5F3FF] text-[#7C3AED] text-xs font-medium">KN</AvatarFallback>
                    </Avatar>
                    <div
                        className={cn(
                            "flex-1 min-w-0 transition-all duration-300 overflow-hidden",
                            isSidebarCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                        )}
                    >
                        <p className="text-sm font-medium text-[#1a1d2e] dark:text-white truncate leading-tight">Kavinnandha</p>
                        <p className="text-xs text-[#94a3b8] truncate leading-tight mt-0.5">kavinnandha@carzio.com</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
