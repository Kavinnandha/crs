"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
    Plus, MoreHorizontal,
    Eye, XCircle, LayoutGrid, List, User, Pencil, Trash2
} from "lucide-react";
import { useDashboard } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/tables/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Booking, Customer, Vehicle } from "@/types";
import Link from "next/link";
import { updateBooking, deleteBooking } from "@/lib/actions";

interface BookingsClientProps {
    initialBookings: Booking[];
    customers: Customer[];
    vehicles: Vehicle[];
}

export default function BookingsClient({ initialBookings, customers, vehicles }: BookingsClientProps) {
    const { setHeaderAction, searchTerm } = useDashboard();
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"table" | "card">("table");

    // View Details Dialog
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Delete Dialog
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        setBookings(initialBookings);
    }, [initialBookings]);

    const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);
    const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);

    const getCustomerById = useCallback((id: string) => customerMap.get(id), [customerMap]);
    const getVehicleById = useCallback((id: string) => vehicleMap.get(id), [vehicleMap]);

    const filteredBookings = useMemo(() => {
        let result = [...bookings];

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(b => {
                const customer = getCustomerById(b.customerId);
                const vehicle = getVehicleById(b.vehicleId);
                return (
                    b.id.toLowerCase().includes(q) ||
                    (customer?.name || "").toLowerCase().includes(q) ||
                    (vehicle ? `${vehicle.brand} ${vehicle.model}` : "").toLowerCase().includes(q)
                );
            });
        }

        if (statusFilter !== "all") {
            result = result.filter((b) => b.status === statusFilter);
        }
        return result.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [bookings, statusFilter, searchTerm, getCustomerById, getVehicleById]);

    // Inject action button into navbar
    useEffect(() => {
        setHeaderAction(
            <Link href="/dashboard/bookings/new">
                <Button
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl h-10 px-3 md:px-5 shadow-sm shadow-[#7C3AED]/20 font-medium text-sm gap-2"
                >
                    <Plus className="h-4 w-4" /> <span className="hidden md:inline">New Booking</span>
                </Button>
            </Link>
        );
        return () => setHeaderAction(null);
    }, [setHeaderAction]);

    const handleCancel = async (booking: Booking) => {
        const formData = new FormData();
        formData.append("status", "Cancelled");
        // Also need to pass other required fields if updateBooking replaces object? 
        // My updateBooking implementation in actions.ts uses:
        /*
        const data = {
            customerId: formData.get("customerId") as string,
            vehicleId: formData.get("vehicleId") as string,
            pickupDate: new Date(formData.get("pickupDate") as string),
            dropDate: new Date(formData.get("dropDate") as string),
            status: formData.get("status") as string,
            totalAmount: Number(formData.get("totalAmount")),
            notes: formData.get("notes") as string,
        };
        */
        // It REPLACES properties. If I only send status, others might become undefined or error.
        // `get` returns null if missing. `as string` casts null -> "null" or throws? No, `as string` matches TS type. `formData.get` returns `FormDataEntryValue | null`.
        // So passing only status will break other fields (make them null/undefined/invalid Date).

        // I need to correct updateBooking to use partial update OR send all data.
        // OR better: create a specialized `cancelBooking` action.
        // Since I cannot edit actions.ts easily right now without risk, I will send ALL data.

        formData.append("customerId", booking.customerId);
        formData.append("vehicleId", booking.vehicleId);
        formData.append("pickupDate", booking.pickupDate);
        formData.append("dropDate", booking.dropDate);
        formData.append("totalAmount", booking.totalAmount.toString());
        formData.append("notes", booking.notes || "");

        try {
            await updateBooking(booking.id, formData);
        } catch (e) {
            console.error("Cancel failed", e);
        }
    };

    const handleDelete = async () => {
        if (bookingToDelete) {
            try {
                const result = await deleteBooking(bookingToDelete.id);
                if (result && result.success) {
                    setDeleteOpen(false);
                    setBookingToDelete(null);
                } else {
                    setDeleteOpen(false);
                    setAlertMessage(result?.message || "Failed to delete booking");
                    setAlertOpen(true);
                }
            } catch (e) {
                console.error("Delete failed", e);
                setDeleteOpen(false);
                setAlertMessage("An unexpected error occurred");
                setAlertOpen(true);
            }
        }
    };

    // Filters component for inline rendering
    const filtersContent = (
        <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 rounded-xl border-[#E8E5F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#64748B] dark:text-slate-300 shadow-none focus:ring-[#7C3AED]/20">
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E8E5F0] dark:border-slate-700 shadow-lg">
                    <SelectItem value="all" className="rounded-lg">All Status</SelectItem>
                    <SelectItem value="Reserved" className="rounded-lg">Reserved</SelectItem>
                    <SelectItem value="Active" className="rounded-lg">Active</SelectItem>
                    <SelectItem value="Completed" className="rounded-lg">Completed</SelectItem>
                    <SelectItem value="Cancelled" className="rounded-lg">Cancelled</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex items-center gap-0.5 ml-1 bg-[#F8F9FC] dark:bg-slate-800 rounded-xl p-0.5 border border-[#E8E5F0] dark:border-slate-700">
                <Button variant="ghost" size="icon" onClick={() => setViewMode("table")}
                    className={`h-8 w-8 rounded-lg ${viewMode === "table" ? "bg-white dark:bg-slate-700 shadow-sm text-[#7C3AED]" : "text-[#94a3b8] hover:text-[#64748B]"}`}>
                    <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setViewMode("card")}
                    className={`h-8 w-8 rounded-lg ${viewMode === "card" ? "bg-white dark:bg-slate-700 shadow-sm text-[#7C3AED]" : "text-[#94a3b8] hover:text-[#64748B]"}`}>
                    <LayoutGrid className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <div>
            <PageHeader
                title="Bookings"
                description="Manage all rental bookings"
                breadcrumb={["Dashboard", "Bookings"]}
                filters={filtersContent}
            />

            <p className="text-sm text-[#94a3b8] font-medium mb-3">
                {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""}
            </p>

            {viewMode === "table" ? (
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
                                                <TableCell className="text-sm text-nowrap">{customer?.name || "—"}</TableCell>
                                                <TableCell className="text-sm text-nowrap">
                                                    {vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"}
                                                </TableCell>
                                                <TableCell className="text-sm text-nowrap">
                                                    {new Date(booking.pickupDate).toLocaleString("en-IN", { dateStyle: 'medium', timeStyle: 'short' })}
                                                </TableCell>
                                                <TableCell className="text-sm text-nowrap">
                                                    {new Date(booking.dropDate).toLocaleString("en-IN", { dateStyle: 'medium', timeStyle: 'short' })}
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
                                                            <Link href={`/dashboard/bookings/${booking.id}/edit`}>
                                                                <DropdownMenuItem>
                                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                </DropdownMenuItem>
                                                            </Link>
                                                            {booking.status !== "Cancelled" && booking.status !== "Completed" && (
                                                                <DropdownMenuItem className="text-destructive" onClick={() => handleCancel(booking)}>
                                                                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-500" onClick={() => { setBookingToDelete(booking); setDeleteOpen(true); }}>
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
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
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBookings.map((booking) => {
                        const customer = getCustomerById(booking.customerId);
                        const vehicle = getVehicleById(booking.vehicleId);
                        const pickup = new Date(booking.pickupDate);
                        const drop = new Date(booking.dropDate);

                        return (
                            <Card key={booking.id} className="group relative overflow-hidden bg-card hover:shadow-md transition-all">
                                <CardHeader className="pb-3 pt-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-mono text-xs font-medium text-muted-foreground mb-1">{booking.id.toUpperCase()}</p>
                                            <CardTitle className="text-base font-semibold truncate leading-tight">
                                                {vehicle ? `${vehicle.brand} ${vehicle.model}` : "Unknown Vehicle"}
                                            </CardTitle>
                                        </div>
                                        <StatusBadge status={booking.status} variant="booking" />
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-3 text-sm space-y-3">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <User className="h-4 w-4 shrink-0" />
                                        <span className="text-foreground truncate">{customer?.name || "Unknown Customer"}</span>
                                    </div>
                                    <div className="space-y-1.5 p-2 bg-muted/40 rounded-md border text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Pickup</span>
                                            <span className="font-medium">{pickup.toLocaleDateString("en-IN", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Drop</span>
                                            <span className="font-medium">{drop.toLocaleDateString("en-IN", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-3 border-t bg-muted/10 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Amount</p>
                                        <p className="font-semibold text-lg text-primary">{formatCurrency(booking.totalAmount)}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setViewOpen(true); }}>
                                                <Eye className="mr-2 h-4 w-4" /> Details
                                            </DropdownMenuItem>
                                            <Link href={`/dashboard/bookings/${booking.id}/edit`}>
                                                <DropdownMenuItem>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                            </Link>
                                            {booking.status !== "Cancelled" && (
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleCancel(booking)}>
                                                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

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
                                        ["Pickup", new Date(selectedBooking.pickupDate).toLocaleString("en-IN", { dateStyle: 'medium', timeStyle: 'short' })],
                                        ["Drop", new Date(selectedBooking.dropDate).toLocaleString("en-IN", { dateStyle: 'medium', timeStyle: 'short' })],
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

            {/* Delete Dialog */}
            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-sm rounded-2xl border-[#E8E5F0] dark:border-slate-800 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-[#1a1d2e] dark:text-white text-lg font-semibold">Delete Booking</DialogTitle>
                        <DialogDescription className="text-[#94a3b8]">
                            Are you sure you want to delete this booking? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
                <DialogContent className="max-w-m rounded-2xl border-border shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-[#1a1d2e] dark:text-white text-lg font-semibold flex items-center gap-2">
                            <span className="text-amber-500">⚠️</span> Cannot Delete Booking
                        </DialogTitle>
                        <DialogDescription className="text-[#64748B] text-base pt-2">
                            {alertMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setAlertOpen(false)} className="rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white">Okay</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
