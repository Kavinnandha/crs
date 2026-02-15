"use client";

import { Search, PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "./dashboard-layout";

import { usePathname } from "next/navigation";

interface HeaderProps {
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    action?: React.ReactNode;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

export function Header({ sidebarCollapsed, onToggleSidebar, action, mobileOpen, setMobileOpen }: HeaderProps) {
    const { searchTerm, setSearchTerm } = useDashboard();
    const pathname = usePathname();
    const isFormPage = pathname.endsWith("/new") || pathname.endsWith("/edit");

    return (
        <header
            className="sticky top-0 z-30 flex flex-col md:flex-row md:h-16 items-center gap-4 bg-[#F8F9FC] dark:bg-slate-950 px-4 md:px-6 transition-all duration-300 py-2 md:py-0 shadow-sm md:shadow-none"
            style={{
                marginLeft: "var(--header-margin-left)",
            }}
        >
            <style jsx>{`
                header {
                    --header-margin-left: ${sidebarCollapsed ? "68px" : "220px"};
                }
                @media (max-width: 768px) {
                    header {
                        --header-margin-left: 0px !important;
                    }
                }
            `}</style>

            <div className="flex items-center w-full md:w-auto flex-1 relative justify-between md:justify-start">
                {/* Mobile Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden h-9 w-9 text-[#94a3b8] hover:text-[#64748B] hover:bg-white dark:hover:bg-slate-900 rounded-xl shrink-0 z-10"
                >
                    <Menu className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </Button>

                {/* Mobile Logo & Name (Centered) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 md:hidden">
                    <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 relative">
                        <Image src="/carzio.jpg" alt="Carzio" fill className="object-cover" />
                    </div>
                    <span className="text-lg font-semibold text-[#1a1d2e] dark:text-white tracking-tight">
                        Carzio
                    </span>
                </div>

                {/* Desktop Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="hidden md:flex h-9 w-9 text-[#94a3b8] hover:text-[#64748B] hover:bg-white dark:hover:bg-slate-900 rounded-xl shrink-0"
                >
                    {sidebarCollapsed ? (
                        <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    ) : (
                        <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    )}
                </Button>

                {/* Search Bar - Desktop */}
                <div className="hidden md:block relative w-full max-w-md ml-4 mr-auto">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                    <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 bg-white dark:bg-slate-900 border-[#E8E5F0] dark:border-slate-800 rounded-xl text-sm text-[#1a1d2e] dark:text-white placeholder:text-[#94a3b8] focus-visible:ring-[#7C3AED]/20 focus-visible:border-[#7C3AED]/40 shadow-none"
                    />
                </div>

                {/* Mobile Action Place */}
                <div className="md:hidden z-10">
                    {action}
                </div>
            </div>

            {/* Desktop Action Place */}
            <div className="hidden md:flex items-center gap-2 ml-auto">
                {action}
            </div>

            {/* Mobile Search Row - Hide if isFormPage is true or specific dashboard pages */}
            {!isFormPage &&
                pathname !== "/dashboard" &&
                pathname !== "/dashboard/overview" &&
                pathname !== "/dashboard/reports" &&
                !(pathname.startsWith("/dashboard/customers/") && pathname.split("/").length > 3 && !pathname.endsWith("/edit")) && (
                    <div className="w-full md:hidden pt-2">
                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                            <Input
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-10 bg-white dark:bg-slate-900 border-[#E8E5F0] dark:border-slate-800 rounded-xl text-sm text-[#1a1d2e] dark:text-white placeholder:text-[#94a3b8] focus-visible:ring-[#7C3AED]/20 focus-visible:border-[#7C3AED]/40 shadow-none w-full"
                            />
                        </div>
                    </div>
                )}
        </header>
    );
}
