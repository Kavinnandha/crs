"use client";

import { useState, useMemo } from "react";
import {
    Users, Search, Eye, Phone, Mail, MapPin, CreditCard as License, CalendarDays,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/tables/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    customers as initialCustomers, getBookingsByCustomerId, getVehicleById, formatCurrency,
} from "@/lib/mock-data";
import { Customer } from "@/types";

export default function CustomersPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [profileOpen, setProfileOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const filteredCustomers = useMemo(() => {
        let result = [...initialCustomers];
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    c.phone.includes(q) ||
                    c.drivingLicenseNumber.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") {
            result = result.filter((c) => c.verificationStatus === statusFilter);
        }
        return result;
    }, [search, statusFilter]);

    const openProfile = (customer: Customer) => {
        setSelectedCustomer(customer);
        setProfileOpen(true);
    };

    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div>
            <PageHeader
                title="Customers"
                description="View and manage customer records"
                icon={Users}
            />

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, phone, or license..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Verification" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Verified">Verified</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                    {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""} found
                </p>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>License No.</TableHead>
                                <TableHead>Verification</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="w-[80px]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                        {getInitials(customer.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{customer.name}</p>
                                                    <p className="text-xs text-muted-foreground">{customer.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{customer.phone}</TableCell>
                                        <TableCell className="font-mono text-xs">{customer.drivingLicenseNumber}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={customer.verificationStatus} variant="verification" />
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => openProfile(customer)}>
                                                <Eye className="h-4 w-4 mr-1" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Profile Dialog */}
            <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Customer Profile</DialogTitle>
                    </DialogHeader>
                    {selectedCustomer && (() => {
                        const rentalHistory = getBookingsByCustomerId(selectedCustomer.id);
                        return (
                            <div className="space-y-6">
                                {/* Profile Header */}
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14">
                                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                            {getInitials(selectedCustomer.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                                        <StatusBadge status={selectedCustomer.verificationStatus} variant="verification" />
                                    </div>
                                </div>

                                <Separator />

                                {/* Contact Details */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-muted-foreground">Contact Information</h4>
                                    <div className="space-y-2">
                                        {[
                                            { icon: Mail, value: selectedCustomer.email },
                                            { icon: Phone, value: selectedCustomer.phone },
                                            { icon: MapPin, value: selectedCustomer.address },
                                            { icon: License, value: selectedCustomer.drivingLicenseNumber },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm">
                                                <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <span>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Rental History */}
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                                        Rental History ({rentalHistory.length})
                                    </h4>
                                    {rentalHistory.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No rental history yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {rentalHistory.map((booking) => {
                                                const vehicle = getVehicleById(booking.vehicleId);
                                                return (
                                                    <div key={booking.id} className="flex items-center gap-3 rounded-lg border p-3">
                                                        <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium">
                                                                {vehicle ? `${vehicle.brand} ${vehicle.model}` : "Unknown"}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(booking.pickupDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                                {" → "}
                                                                {new Date(booking.dropDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium">{formatCurrency(booking.totalAmount)}</p>
                                                            <StatusBadge status={booking.status} variant="booking" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
