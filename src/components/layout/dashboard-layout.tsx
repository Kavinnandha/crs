"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            <Header sidebarCollapsed={collapsed} />
            <main
                className={cn(
                    "min-h-[calc(100vh-4rem)] transition-all duration-300 p-6",
                    collapsed ? "ml-[68px]" : "ml-[260px]"
                )}
            >
                {children}
            </main>
        </div>
    );
}
