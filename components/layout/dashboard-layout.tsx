"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar 
                collapsed={collapsed} 
                onToggle={() => setCollapsed(!collapsed)}
                mobileMenuOpen={mobileMenuOpen}
                onMobileMenuChange={setMobileMenuOpen}
            />
            <Header 
                sidebarCollapsed={collapsed}
                onMobileMenuToggle={() => setMobileMenuOpen(true)}
            />
            <main
                className={cn(
                    "min-h-[calc(100vh-4rem)] transition-all duration-300 p-4 sm:p-6",
                    "md:ml-[68px] lg:ml-[260px]",
                    collapsed ? "lg:ml-[68px]" : "lg:ml-[260px]"
                )}
            >
                {children}
            </main>
        </div>
    );
}
