"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Plus, MoreHorizontal, Pencil, Trash2, Eye, LayoutGrid, List,
    Calendar, Zap, Gauge, Droplets
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
import { Vehicle } from "@/types";
import { deleteVehicle } from "@/lib/actions";
import Link from "next/link";


interface VehiclesClientProps {
    initialVehicles: Vehicle[];
}

type SortKey = "brand" | "pricePerDay" | "year" | "status" | "category";
type SortDir = "asc" | "desc";

export default function VehiclesClient({ initialVehicles }: VehiclesClientProps) {
    const { setHeaderAction, searchTerm } = useDashboard();
    // const router = useRouter(); 
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);

    // Sync vehicles when initialVehicles changes (e.g. after revalidate)
    useEffect(() => {
        setVehicles(initialVehicles);
    }, [initialVehicles]);

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [sortKey] = useState<SortKey>("brand");
    const [sortDir] = useState<SortDir>("asc");
    const [viewMode, setViewMode] = useState<"table" | "card">("card");

    // Delete state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

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
            try {
                const result = await deleteVehicle(vehicleToDelete.id);
                console.log("Delete result:", result);
                if (result && result.success) {
                    setDeleteOpen(false);
                    setVehicleToDelete(null);
                } else if (result) {
                    setDeleteOpen(false);
                    setAlertMessage(result.message || "Failed to delete vehicle");
                    setAlertOpen(true);
                } else {
                    console.error("Delete action returned undefined");
                    setDeleteOpen(false);
                    setAlertMessage("An unexpected error occurred (no response from server)");
                    setAlertOpen(true);
                }
            } catch (error) {
                console.error("Error invoking deleteVehicle:", error);
                setDeleteOpen(false);
                setAlertMessage("An unexpected error occurred");
                setAlertOpen(true);
            }
        }
    };

    const confirmDelete = (vehicle: Vehicle) => {
        setVehicleToDelete(vehicle);
        setDeleteOpen(true);
    };

    // Helper functions for styles


    const getCategoryStyle = (category: string) => {
        switch (category) {
            case 'SUV': return 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 border-violet-200 dark:border-violet-800';
            case 'Sedan': return 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 border-sky-200 dark:border-sky-800';
            case 'Hatchback': return 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 border-teal-200 dark:border-teal-800';
            case 'Luxury': return 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-200 dark:border-rose-800';
            default: return 'bg-gray-50 dark:bg-gray-950/30 text-gray-600 border-gray-200 dark:border-gray-800';
        }
    };

    const filtersContent = (
        <div className="flex flex-wrap items-center gap-2 justify-end">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[110px] sm:w-[140px] h-9 rounded-xl border-[#E8E5F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#64748B] dark:text-slate-300 shadow-none focus:ring-[#7C3AED]/20">
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border shadow-lg">
                    <SelectItem value="all" className="rounded-lg">All Status</SelectItem>
                    <SelectItem value="Available" className="rounded-lg">Available</SelectItem>
                    <SelectItem value="Rented" className="rounded-lg">Rented</SelectItem>
                    <SelectItem value="Maintenance" className="rounded-lg">Maintenance</SelectItem>
                </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[120px] sm:w-[150px] h-9 rounded-xl border-[#E8E5F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#64748B] dark:text-slate-300 shadow-none focus:ring-[#7C3AED]/20">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border shadow-lg">
                    <SelectItem value="all" className="rounded-lg">All Categories</SelectItem>
                    <SelectItem value="Hatchback" className="rounded-lg">Hatchback</SelectItem>
                    <SelectItem value="Sedan" className="rounded-lg">Sedan</SelectItem>
                    <SelectItem value="SUV" className="rounded-lg">SUV</SelectItem>
                    <SelectItem value="Luxury" className="rounded-lg">Luxury</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex items-center gap-0.5 ml-1 bg-muted rounded-xl p-0.5 border border-border">
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
                <Card className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
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
                                        <TableRow key={vehicle.id} className="border-border hover:bg-muted/50">
                                            <TableCell>
                                                <div>
                                                    <Link href={`/dashboard/vehicles/${vehicle.id}`} className="hover:underline">
                                                        <p className="font-medium text-sm text-[#1a1d2e] dark:text-white">{vehicle.brand} {vehicle.model}</p>
                                                    </Link>
                                                    <p className="text-xs text-[#94a3b8]">{vehicle.year} • {vehicle.transmission} • {vehicle.fuelType}</p>
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
                                            <TableCell className="font-medium text-[#1a1d2e] dark:text-white">₹{vehicle.pricePerDay}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#94a3b8] hover:text-[#64748B] hover:bg-[#F8F9FC] dark:hover:bg-slate-800 rounded-lg">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl border-border shadow-lg">
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
                                                        <DropdownMenuSeparator className="bg-border" />
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
                        <Card key={vehicle.id} className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border-border bg-card rounded-3xl">
                            <CardContent className="p-6 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={vehicle.status} variant="vehicle" />
                                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{vehicle.category}</span>
                                        </div>
                                        <Link href={`/dashboard/vehicles/${vehicle.id}`} className="block hover:text-[#7C3AED] transition-colors">
                                            <h3 className="font-bold text-lg text-[#1a1d2e] dark:text-white line-clamp-1">{vehicle.brand} {vehicle.model}</h3>
                                        </Link>
                                        <p className="text-xs text-muted-foreground font-mono">{vehicle.registrationNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-[#7C3AED]">₹{vehicle.pricePerDay}</div>
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">/ day</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-slate-400">
                                        <Calendar className="h-4 w-4 text-[#94a3b8]" />
                                        <span>{vehicle.year}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-slate-400">
                                        <Zap className="h-4 w-4 text-[#94a3b8]" />
                                        <span>{vehicle.fuelType}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-slate-400">
                                        <Gauge className="h-4 w-4 text-[#94a3b8]" />
                                        <span>{vehicle.transmission}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-slate-400">
                                        <Droplets className="h-4 w-4 text-[#94a3b8]" />
                                        <span>{vehicle.color}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                                    <Link href={`/dashboard/vehicles/${vehicle.id}`} className="w-full mr-2">
                                        <Button variant="outline" className="w-full h-9 text-xs font-medium rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                                            View Details
                                        </Button>
                                    </Link>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-[#94a3b8] hover:text-[#1a1d2e] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shrink-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl border-border shadow-lg p-1 w-32">
                                            <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
                                                <DropdownMenuItem className="rounded-lg cursor-pointer text-xs font-medium">
                                                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuItem
                                                className="text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer text-xs font-medium"
                                                onClick={() => confirmDelete(vehicle)}
                                            >
                                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
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
                <DialogContent className="max-w-sm rounded-2xl border-border shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-[#1a1d2e] dark:text-white text-lg font-semibold">Delete Vehicle</DialogTitle>
                        <DialogDescription className="text-[#94a3b8]">
                            Are you sure you want to delete {vehicleToDelete?.brand} {vehicleToDelete?.model}?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl border-border text-muted-foreground hover:bg-muted shadow-none">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} className="rounded-xl shadow-sm">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
                <DialogContent className="max-w-m rounded-2xl border-border shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-[#1a1d2e] dark:text-white text-lg font-semibold flex items-center gap-2">
                            <span className="text-amber-500">⚠️</span> Cannot Delete Vehicle
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
