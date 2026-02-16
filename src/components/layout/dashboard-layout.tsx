"use client";

import { useState, createContext, useContext } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

// Context to allow pages to inject action buttons into the header
interface DashboardContextType {
  setHeaderAction: (action: React.ReactNode) => void;
  sidebarCollapsed: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const DashboardContext = createContext<DashboardContextType>({
  setHeaderAction: () => {},
  sidebarCollapsed: false,
  searchTerm: "",
  setSearchTerm: () => {},
  mobileMenuOpen: false,
  setMobileMenuOpen: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [headerAction, setHeaderAction] = useState<React.ReactNode>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <DashboardContext.Provider
      value={{
        setHeaderAction,
        sidebarCollapsed: collapsed,
        searchTerm,
        setSearchTerm,
        mobileMenuOpen,
        setMobileMenuOpen,
      }}
    >
      <div className="min-h-screen bg-[#F8F9FC] dark:bg-slate-950">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />
        <Header
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
          action={headerAction}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />
        <main
          className={cn(
            "min-h-[calc(100vh-4rem)] transition-all duration-300 p-6 bg-white dark:bg-slate-900 rounded-tl-[2rem]",
            collapsed ? "ml-[68px]" : "ml-[220px]",
            "max-md:ml-0 max-md:p-4 max-md:rounded-none",
          )}
        >
          {children}
        </main>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </div>
    </DashboardContext.Provider>
  );
}
