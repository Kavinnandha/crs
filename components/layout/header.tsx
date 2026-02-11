"use client";

import { Bell, Search, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
    sidebarCollapsed: boolean;
    onMobileMenuToggle: () => void;
}

export function Header({ sidebarCollapsed, onMobileMenuToggle }: HeaderProps) {
    return (
        <header
            className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-4 sm:px-6 transition-all duration-300 md:ml-[68px] lg:ml-[260px]"
            style={{
                marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 
                    ? (sidebarCollapsed ? "68px" : "260px") 
                    : typeof window !== 'undefined' && window.innerWidth >= 768 
                    ? "68px" 
                    : "0",
            }}
        >
            {/* Mobile Menu Button */}
            <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden h-9 w-9"
                onClick={onMobileMenuToggle}
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Search */}
            <div className="relative w-full max-w-sm hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search vehicles, customers, bookings..."
                    className="pl-9 bg-muted/50 border-none h-9"
                />
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-4 w-4" />
                    <Badge className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                        3
                    </Badge>
                </Button>

                <Separator orientation="vertical" className="h-6 hidden sm:block" />

                {/* Admin Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                            <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    AD
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden lg:flex flex-col items-start">
                                <span className="text-sm font-medium leading-none">Admin</span>
                                <span className="text-[11px] text-muted-foreground leading-none mt-0.5">
                                    admin@speedwheels.in
                                </span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
