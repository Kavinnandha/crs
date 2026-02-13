
"use client";

import { useState, useMemo } from "react";
import {
    Users, Search, Eye, Phone, Mail, MapPin, CreditCard as License, CalendarDays,
    Plus, Pencil, Trash2, MoreHorizontal,
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
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { Customer, Booking, Vehicle } from "@/types";

interface CustomersClientProps {
    customers: Customer[];
    bookings: Booking[];
    vehicles: Vehicle[];
}

export default function CustomersClient({ customers, bookings, vehicles }: CustomersClientProps) {
    const [customersList, setCustomersList] = useState<Customer[]>(customers);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [profileOpen, setProfileOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState<Partial<Customer>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);

    const getBookingsByCustomerId = (customerId: string) => {
        return bookings.filter(b => b.customerId === customerId);
    };

    const getVehicleById = (id: string) => vehicleMap.get(id);

    const filteredCustomers = useMemo(() => {
        let result = [...customersList];
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
    }, [search, statusFilter, customersList]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.name?.trim()) errors.name = "Name is required";
        if (!formData.email?.trim() || !/^\S+@\S+\.\S+$/.test(formData.email || "")) errors.email = "Valid email required";
        if (!formData.phone?.trim()) errors.phone = "Phone is required";
        if (!formData.drivingLicenseNumber?.trim()) errors.drivingLicenseNumber = "License number is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openAddForm = () => {
        setSelectedCustomer(null);
        setFormData({ verificationStatus: "Pending" });
        setFormErrors({});
        setFormOpen(true);
    };

    const openEditForm = (customer: Customer) => {
        setSelectedCustomer(customer);
        setFormData({ ...customer });
        setFormErrors({});
        setFormOpen(true);
    };

    const handleSave = () => {
        if (!validateForm()) return;

        if (selectedCustomer) {
            setCustomersList(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, ...formData } as Customer : c));
        } else {
            const newCustomer: Customer = {
                id: `c${Date.now()}`,
                name: formData.name!,
                email: formData.email!,
                phone: formData.phone!,
                address: formData.address || "",
                drivingLicenseNumber: formData.drivingLicenseNumber!,
                verificationStatus: (formData.verificationStatus as any) || "Pending",
                createdAt: new Date().toISOString(),
            };
            setCustomersList(prev => [newCustomer, ...prev]);
        }
        setFormOpen(false);
    };

    const handleDelete = () => {
        if (selectedCustomer) {
            setCustomersList(prev => prev.filter(c => c.id !== selectedCustomer.id));
        }
        setDeleteOpen(false);
        setSelectedCustomer(null);
    };

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
            >
                <Button onClick={openAddForm}>
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
            </PageHeader>

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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openProfile(customer)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditForm(customer)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => { setSelectedCustomer(customer); setDeleteOpen(true); }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
                                                                {new Date(booking.pickupDate).toLocaleString("en-IN", { dateStyle: 'medium', timeStyle: 'short' })}
                                                                {" → "}
                                                                {new Date(booking.dropDate).toLocaleString("en-IN", { dateStyle: 'medium', timeStyle: 'short' })}
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

            {/* Add/Edit Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{selectedCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                        <DialogDescription>
                            {selectedCustomer ? "Update the customer details below." : "Enter the details for the new customer."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input id="name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input id="phone" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                {formErrors.phone && <p className="text-xs text-destructive">{formErrors.phone}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="license">License Number *</Label>
                                <Input id="license" value={formData.drivingLicenseNumber || ""} onChange={(e) => setFormData({ ...formData, drivingLicenseNumber: e.target.value.toUpperCase() })} />
                                {formErrors.drivingLicenseNumber && <p className="text-xs text-destructive">{formErrors.drivingLicenseNumber}</p>}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Verification Status</Label>
                            <Select value={formData.verificationStatus || "Pending"} onValueChange={(v) => setFormData({ ...formData, verificationStatus: v as any })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Verified">Verified</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Customer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedCustomer?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
