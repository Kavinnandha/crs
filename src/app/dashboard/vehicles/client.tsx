"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Car, Battery, Zap, Droplets, Gauge, Calendar, DollarSign,
    Plus, Search, Filter, ArrowUpDown, MoreHorizontal, Pencil, Trash2, Eye, LayoutGrid, List, SlidersHorizontal,
} from "lucide-react";
import { useDashboard } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/tables/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Vehicle, Booking } from "@/types";
import { deleteVehicle } from "@/lib/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface VehiclesClientProps {
    initialVehicles: Vehicle[];
    bookings: Booking[];
}

type SortKey = "brand" | "pricePerDay" | "year" | "status" | "category";
type SortDir = "asc" | "desc";

export default function VehiclesClient({ initialVehicles, bookings }: VehiclesClientProps) {
    const { setHeaderAction, searchTerm } = useDashboard();
    const router = useRouter(); // Use router for navigation if needed, though Links are better
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);

    // Sync vehicles when initialVehicles changes (e.g. after revalidate)
    useEffect(() => {
        setVehicles(initialVehicles);
    }, [initialVehicles]);

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [sortKey, setSortKey] = useState<SortKey>("brand");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [viewMode, setViewMode] = useState<"table" | "card">("card");

    // Delete state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

    // Provide the Add button into header
    useEffect(() => {
        setHeaderAction(
            <Link href="/dashboard/vehicles/new">
                <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl h-10 px-5 shadow-sm shadow-[#7C3AED]/20 font-medium text-sm gap-2 whitespace-nowrap">
                    <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Vehicle</span>
                </Button>
            </Link>
        );
        return () => setHeaderAction(null);
    }, [setHeaderAction]);

    const filteredVehicles = useMemo(() => {
        let result = [...vehicles];
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(
                (v) =>
                    v.brand.toLowerCase().includes(q) ||
                    v.model.toLowerCase().includes(q) ||
                    v.registrationNumber.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") {
            result = result.filter((v) => v.status === statusFilter);
        }
        if (categoryFilter !== "all") {
            result = result.filter((v) => v.category === categoryFilter);
        }
        result.sort((a, b) => {
            let cmp = 0;
            if (sortKey === "brand") cmp = `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
            else if (sortKey === "year") cmp = a.year - b.year;
            else if (sortKey === "pricePerDay") cmp = a.pricePerDay - b.pricePerDay;
            else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
            else if (sortKey === "category") cmp = a.category.localeCompare(b.category);
            return sortDir === "asc" ? cmp : -cmp;
        });
        return result;
    }, [vehicles, searchTerm, statusFilter, categoryFilter, sortKey, sortDir]);

    const handleDelete = async () => {
        if (vehicleToDelete) {
            await deleteVehicle(vehicleToDelete.id);
            setDeleteOpen(false);
            setVehicleToDelete(null);
        }
    };

    const confirmDelete = (vehicle: Vehicle) => {
        setVehicleToDelete(vehicle);
        setDeleteOpen(true);
    };

    // Helper functions for styles
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Rented': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Maintenance': return 'bg-amber-50 text-amber-600 border-amber-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getCategoryStyle = (category: string) => {
        switch (category) {
            case 'SUV': return 'bg-violet-50 text-violet-600 border-violet-200';
            case 'Sedan': return 'bg-sky-50 text-sky-600 border-sky-200';
            case 'Hatchback': return 'bg-teal-50 text-teal-600 border-teal-200';
            case 'Luxury': return 'bg-rose-50 text-rose-600 border-rose-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const filtersContent = (
        <div className="flex flex-wrap items-center gap-2 justify-end">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[110px] sm:w-[140px] h-9 rounded-xl border-[#E8E5F0] bg-white text-sm text-[#64748B] shadow-none focus:ring-[#7C3AED]/20">
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E8E5F0] shadow-lg">
                    <SelectItem value="all" className="rounded-lg">All Status</SelectItem>
                    <SelectItem value="Available" className="rounded-lg">Available</SelectItem>
                    <SelectItem value="Rented" className="rounded-lg">Rented</SelectItem>
                    <SelectItem value="Maintenance" className="rounded-lg">Maintenance</SelectItem>
                </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[120px] sm:w-[150px] h-9 rounded-xl border-[#E8E5F0] bg-white text-sm text-[#64748B] shadow-none focus:ring-[#7C3AED]/20">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E8E5F0] shadow-lg">
                    <SelectItem value="all" className="rounded-lg">All Categories</SelectItem>
                    <SelectItem value="Hatchback" className="rounded-lg">Hatchback</SelectItem>
                    <SelectItem value="Sedan" className="rounded-lg">Sedan</SelectItem>
                    <SelectItem value="SUV" className="rounded-lg">SUV</SelectItem>
                    <SelectItem value="Luxury" className="rounded-lg">Luxury</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex items-center gap-0.5 ml-1 bg-[#F8F9FC] rounded-xl p-0.5 border border-[#E8E5F0]">
                <Button variant="ghost" size="icon" onClick={() => setViewMode("table")}
                    className={`h-8 w-8 rounded-lg ${viewMode === "table" ? "bg-white shadow-sm text-[#7C3AED]" : "text-[#94a3b8] hover:text-[#64748B]"}`}>
                    <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setViewMode("card")}
                    className={`h-8 w-8 rounded-lg ${viewMode === "card" ? "bg-white shadow-sm text-[#7C3AED]" : "text-[#94a3b8] hover:text-[#64748B]"}`}>
                    <LayoutGrid className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <div>
            <PageHeader
                title="Fleet Management"
                description="Manage your vehicle fleet"
                breadcrumb={["Dashboard", "Vehicles"]}
                filters={filtersContent}
            />

            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-[#94a3b8] font-medium">
                    {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? "s" : ""} found
                </p>
            </div>

            {viewMode === "table" ? (
                <Card className="bg-white rounded-2xl border border-[#E8E5F0] shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Reg. Number</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Price/Day</TableHead>
                                    <TableHead className="w-[80px]" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVehicles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-[#94a3b8]">
                                            No vehicles found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredVehicles.map((vehicle) => (
                                        <TableRow key={vehicle.id} className="border-[#E8E5F0] hover:bg-[#F8F9FC]">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-16 rounded-lg bg-gray-100 overflow-hidden">
                                                        <img src={vehicle.imageUrl} alt={vehicle.model} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <Link href={`/dashboard/vehicles/${vehicle.id}`} className="hover:underline">
                                                            <p className="font-medium text-sm text-[#1a1d2e]">{vehicle.brand} {vehicle.model}</p>
                                                        </Link>
                                                        <p className="text-xs text-[#94a3b8]">{vehicle.year} • {vehicle.transmission} • {vehicle.fuelType}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryStyle(vehicle.category)}`}>
                                                    {vehicle.category}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-[#64748B]">{vehicle.registrationNumber}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={vehicle.status} variant="vehicle" />
                                            </TableCell>
                                            <TableCell className="font-medium text-[#1a1d2e]">₹{vehicle.pricePerDay}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#94a3b8] hover:text-[#64748B] hover:bg-[#F8F9FC] rounded-lg">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl border-[#E8E5F0] shadow-lg">
                                                        <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                                                            <DropdownMenuItem className="rounded-lg cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                                            </DropdownMenuItem>
                                                        </Link>
                                                        <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
                                                            <DropdownMenuItem className="rounded-lg cursor-pointer">
                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                        </Link>
                                                        <DropdownMenuSeparator className="bg-[#E8E5F0]" />
                                                        <DropdownMenuItem
                                                            className="text-red-500 hover:text-red-600 rounded-lg cursor-pointer"
                                                            onClick={() => confirmDelete(vehicle)}
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
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVehicles.map((vehicle) => (
                        <Card key={vehicle.id} className="group relative overflow-hidden transition-all hover:shadow-md border-[#E8E5F0] dark:border-slate-800 bg-white dark:bg-slate-900">
                            <CardContent className="p-5 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <StatusBadge status={vehicle.status} variant="vehicle" />
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getCategoryStyle(vehicle.category)}`}>
                                                {vehicle.category}
                                            </span>
                                        </div>
                                        <Link href={`/dashboard/vehicles/${vehicle.id}`} className="hover:underline">
                                            <h3 className="font-semibold text-xl text-[#1a1d2e] dark:text-white">{vehicle.brand} {vehicle.model}</h3>
                                        </Link>
                                        <p className="text-sm text-muted-foreground">{vehicle.registrationNumber}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-lg font-bold text-[#7C3AED]">₹{vehicle.pricePerDay}</div>
                                        <span className="text-xs text-muted-foreground">/day</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground">Year</span>
                                        <span className="text-sm font-medium">{vehicle.year}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground">Fuel</span>
                                        <div className="flex items-center gap-1.5">
                                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                                            <span className="text-sm font-medium">{vehicle.fuelType}</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground">Transmission</span>
                                        <div className="flex items-center gap-1.5">
                                            <Gauge className="h-3.5 w-3.5 text-blue-500" />
                                            <span className="text-sm font-medium">{vehicle.transmission}</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground">Color</span>
                                        <span className="text-sm font-medium">{vehicle.color}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                                    <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                                        <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg border-slate-200">
                                            Details
                                        </Button>
                                    </Link>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#94a3b8] hover:text-[#64748B] hover:bg-slate-100 rounded-lg">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl border-[#E8E5F0] shadow-lg">
                                            <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
                                                <DropdownMenuItem className="rounded-lg cursor-pointer">
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuSeparator className="bg-[#E8E5F0]" />
                                            <DropdownMenuItem
                                                className="text-red-500 hover:text-red-600 rounded-lg cursor-pointer"
                                                onClick={() => confirmDelete(vehicle)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-sm rounded-2xl border-[#E8E5F0] shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-[#1a1d2e] text-lg font-semibold">Delete Vehicle</DialogTitle>
                        <DialogDescription className="text-[#94a3b8]">
                            Are you sure you want to delete {vehicleToDelete?.brand} {vehicleToDelete?.model}?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl border-[#E8E5F0] text-[#64748B] hover:bg-[#F8F9FC] shadow-none">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} className="rounded-xl shadow-sm">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
