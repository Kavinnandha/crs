
"use client";

import { useState, useMemo } from "react";
import {
    CalendarDays, Plus, Search, CalendarPlus, MoreHorizontal,
    Eye, XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/tables/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import { Booking, BookingStatus, Customer, Vehicle } from "@/types";

interface BookingsClientProps {
    initialBookings: Booking[];
    customers: Customer[];
    vehicles: Vehicle[];
}

export default function BookingsClient({ initialBookings, customers, vehicles }: BookingsClientProps) {
    const [allBookings, setAllBookings] = useState<Booking[]>(initialBookings);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [createOpen, setCreateOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [extendOpen, setExtendOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [formData, setFormData] = useState<Partial<Booking>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [extendDays, setExtendDays] = useState(1);

    const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);
    const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);

    const getCustomerById = (id: string) => customerMap.get(id);
    const getVehicleById = (id: string) => vehicleMap.get(id);

    const filteredBookings = useMemo(() => {
        let result = [...allBookings];
        if (search) {
            const q = search.toLowerCase();
            result = result.filter((b) => {
                const c = getCustomerById(b.customerId);
                const v = getVehicleById(b.vehicleId);
                return (
                    b.id.toLowerCase().includes(q) ||
                    c?.name.toLowerCase().includes(q) ||
                    v?.brand.toLowerCase().includes(q) ||
                    v?.model.toLowerCase().includes(q)
                );
            });
        }
        if (statusFilter !== "all") {
            result = result.filter((b) => b.status === statusFilter);
        }
        return result.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [allBookings, search, statusFilter, customerMap, vehicleMap]);

    // Check for double booking
    const isVehicleBookedInRange = (vehicleId: string, pickup: string, drop: string, excludeId?: string) => {
        return allBookings.some((b) => {
            if (b.vehicleId !== vehicleId) return false;
            if (b.id === excludeId) return false;
            if (b.status === "Cancelled" || b.status === "Completed") return false;
            const bStart = new Date(b.pickupDate).getTime();
            const bEnd = new Date(b.dropDate).getTime();
            const nStart = new Date(pickup).getTime();
            const nEnd = new Date(drop).getTime();
            return nStart < bEnd && nEnd > bStart;
        });
    };

    const availableVehiclesForDates = useMemo(() => {
        if (!formData.pickupDate || !formData.dropDate) return vehicles;
        return vehicles.filter(
            (v) =>
                v.status !== "Maintenance" &&
                !isVehicleBookedInRange(v.id, formData.pickupDate!, formData.dropDate!)
        );
    }, [formData.pickupDate, formData.dropDate, isVehicleBookedInRange, vehicles]);

    const openCreateForm = () => {
        setFormData({ status: "Reserved" });
        setFormErrors({});
        setCreateOpen(true);
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.customerId) errors.customerId = "Customer is required";
        if (!formData.vehicleId) errors.vehicleId = "Vehicle is required";
        if (!formData.pickupDate) errors.pickupDate = "Pickup date is required";
        if (!formData.dropDate) errors.dropDate = "Drop date is required";
        if (formData.pickupDate && formData.dropDate) {
            if (new Date(formData.pickupDate) >= new Date(formData.dropDate))
                errors.dropDate = "Drop date must be after pickup date";
            if (formData.vehicleId && isVehicleBookedInRange(formData.vehicleId, formData.pickupDate, formData.dropDate))
                errors.vehicleId = "Vehicle is already booked for these dates";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateBooking = () => {
        if (!validateForm()) return;
        const vehicle = getVehicleById(formData.vehicleId!);
        const days = Math.ceil(
            (new Date(formData.dropDate!).getTime() - new Date(formData.pickupDate!).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const newBooking: Booking = {
            id: `b${Date.now()}`,
            customerId: formData.customerId!,
            vehicleId: formData.vehicleId!,
            pickupDate: formData.pickupDate!,
            dropDate: formData.dropDate!,
            status: "Reserved",
            totalAmount: (vehicle?.pricePerDay || 0) * days,
            createdAt: new Date().toISOString().slice(0, 10),
            notes: formData.notes || "",
        };
        setAllBookings((prev) => [newBooking, ...prev]);
        setCreateOpen(false);
    };

    const handleExtend = () => {
        if (!selectedBooking || extendDays <= 0) return;
        const vehicle = getVehicleById(selectedBooking.vehicleId);
        const oldDrop = new Date(selectedBooking.dropDate);
        const newDrop = new Date(oldDrop.getTime() + extendDays * 86400000);
        setAllBookings((prev) =>
            prev.map((b) =>
                b.id === selectedBooking.id
                    ? {
                        ...b,
                        dropDate: newDrop.toISOString().slice(0, 10),
                        totalAmount: b.totalAmount + (vehicle?.pricePerDay || 0) * extendDays,
                    }
                    : b
            )
        );
        setExtendOpen(false);
    };

    const handleCancel = (bookingId: string) => {
        setAllBookings((prev) =>
            prev.map((b) => (b.id === bookingId ? { ...b, status: "Cancelled" as BookingStatus } : b))
        );
    };

    return (
        <div>
            <PageHeader title="Bookings" description="Manage all rental bookings" icon={CalendarDays}>
                <Button onClick={openCreateForm}>
                    <Plus className="mr-2 h-4 w-4" /> New Booking
                </Button>
            </PageHeader>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search bookings..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[160px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Reserved">Reserved</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground mb-3">
                {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""}
            </p>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Pickup</TableHead>
                                <TableHead>Drop</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="w-[50px]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No bookings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBookings.map((booking) => {
                                    const customer = getCustomerById(booking.customerId);
                                    const vehicle = getVehicleById(booking.vehicleId);
                                    return (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-mono text-xs font-medium">
                                                {booking.id.toUpperCase()}
                                            </TableCell>
                                            <TableCell className="text-sm">{customer?.name || "—"}</TableCell>
                                            <TableCell className="text-sm">
                                                {vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(booking.pickupDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(booking.dropDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={booking.status} variant="booking" />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(booking.totalAmount)}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setViewOpen(true); }}>
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </DropdownMenuItem>
                                                        {(booking.status === "Active" || booking.status === "Reserved") && (
                                                            <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setExtendDays(1); setExtendOpen(true); }}>
                                                                <CalendarPlus className="mr-2 h-4 w-4" /> Extend Rental
                                                            </DropdownMenuItem>
                                                        )}
                                                        {booking.status !== "Cancelled" && booking.status !== "Completed" && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-destructive" onClick={() => handleCancel(booking.id)}>
                                                                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Booking Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create New Booking</DialogTitle>
                        <DialogDescription>Assign a vehicle to a customer for a rental period.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-1.5">
                            <Label>Customer *</Label>
                            <Select value={formData.customerId || ""} onValueChange={(v) => setFormData({ ...formData, customerId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                                <SelectContent>
                                    {customers.filter((c) => c.verificationStatus === "Verified").map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name} — {c.phone}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formErrors.customerId && <p className="text-xs text-destructive">{formErrors.customerId}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Pickup Date *</Label>
                                <Input type="date" value={formData.pickupDate || ""} onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })} />
                                {formErrors.pickupDate && <p className="text-xs text-destructive">{formErrors.pickupDate}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Drop Date *</Label>
                                <Input type="date" value={formData.dropDate || ""} onChange={(e) => setFormData({ ...formData, dropDate: e.target.value })} />
                                {formErrors.dropDate && <p className="text-xs text-destructive">{formErrors.dropDate}</p>}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Vehicle *</Label>
                            <Select value={formData.vehicleId || ""} onValueChange={(v) => setFormData({ ...formData, vehicleId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                                <SelectContent>
                                    {availableVehiclesForDates.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            {v.brand} {v.model} — {formatCurrency(v.pricePerDay)}/day
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formErrors.vehicleId && <p className="text-xs text-destructive">{formErrors.vehicleId}</p>}
                            {formData.vehicleId && formData.pickupDate && formData.dropDate && (
                                <p className="text-xs text-muted-foreground">
                                    Estimated total: {formatCurrency(
                                        (getVehicleById(formData.vehicleId)?.pricePerDay || 0) *
                                        Math.ceil(
                                            (new Date(formData.dropDate).getTime() - new Date(formData.pickupDate).getTime()) /
                                            86400000
                                        )
                                    )}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Notes</Label>
                            <Textarea value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any additional notes..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateBooking}>Create Booking</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                    </DialogHeader>
                    {selectedBooking && (() => {
                        const customer = getCustomerById(selectedBooking.customerId);
                        const vehicle = getVehicleById(selectedBooking.vehicleId);
                        const days = Math.ceil(
                            (new Date(selectedBooking.dropDate).getTime() -
                                new Date(selectedBooking.pickupDate).getTime()) / 86400000
                        );
                        return (
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="font-mono text-xs">{selectedBooking.id.toUpperCase()}</span>
                                    <StatusBadge status={selectedBooking.status} variant="booking" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        ["Customer", customer?.name || "—"],
                                        ["Vehicle", vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"],
                                        ["Pickup", new Date(selectedBooking.pickupDate).toLocaleDateString("en-IN")],
                                        ["Drop", new Date(selectedBooking.dropDate).toLocaleDateString("en-IN")],
                                        ["Duration", `${days} day${days > 1 ? "s" : ""}`],
                                        ["Total", formatCurrency(selectedBooking.totalAmount)],
                                    ].map(([label, value]) => (
                                        <div key={label}>
                                            <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
                                            <p className="font-medium">{value}</p>
                                        </div>
                                    ))}
                                </div>
                                {selectedBooking.notes && (
                                    <div>
                                        <p className="text-muted-foreground text-xs mb-0.5">Notes</p>
                                        <p>{selectedBooking.notes}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Extend Dialog */}
            <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Extend Rental</DialogTitle>
                        <DialogDescription>
                            Extend the rental period for booking {selectedBooking?.id.toUpperCase()}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label>Additional Days</Label>
                            <Input
                                type="number"
                                min={1}
                                max={30}
                                value={extendDays}
                                onChange={(e) => setExtendDays(Math.max(1, parseInt(e.target.value) || 1))}
                            />
                        </div>
                        {selectedBooking && (
                            <p className="text-sm text-muted-foreground">
                                New drop date:{" "}
                                {new Date(
                                    new Date(selectedBooking.dropDate).getTime() + extendDays * 86400000
                                ).toLocaleDateString("en-IN")}
                                {" • Extra: "}
                                {formatCurrency((getVehicleById(selectedBooking.vehicleId)?.pricePerDay || 0) * extendDays)}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExtendOpen(false)}>Cancel</Button>
                        <Button onClick={handleExtend}>Extend</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
