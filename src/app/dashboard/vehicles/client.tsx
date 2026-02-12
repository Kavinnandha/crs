
"use client";

import { useState, useMemo } from "react";
import { Car, Plus, Search, ArrowUpDown, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/tables/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Vehicle, VehicleCategory, FuelType, TransmissionType, VehicleStatus } from "@/types";

type SortKey = "brand" | "year" | "pricePerDay" | "status" | "category";
type SortDir = "asc" | "desc";

// SortHeader component defined outside to avoid recreation during render
const SortHeader = ({ label, sortKeyName, onClick }: { label: string; sortKeyName: SortKey; onClick: (key: SortKey) => void }) => (
    <TableHead>
        <button onClick={() => onClick(sortKeyName)} className="flex items-center gap-1 hover:text-foreground transition-colors">
            {label}
            <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
    </TableHead>
);

interface VehiclesClientProps {
    initialVehicles: Vehicle[];
}

export default function VehiclesClient({ initialVehicles }: VehiclesClientProps) {
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [sortKey, setSortKey] = useState<SortKey>("brand");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState<Partial<Vehicle>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const filteredVehicles = useMemo(() => {
        let result = [...vehicles];
        if (search) {
            const q = search.toLowerCase();
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
    }, [vehicles, search, statusFilter, categoryFilter, sortKey, sortDir]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.brand?.trim()) errors.brand = "Brand is required";
        if (!formData.model?.trim()) errors.model = "Model is required";
        if (!formData.year || formData.year < 2000 || formData.year > 2026) errors.year = "Valid year required";
        if (!formData.registrationNumber?.trim()) errors.registrationNumber = "Registration number is required";
        if (!formData.pricePerDay || formData.pricePerDay <= 0) errors.pricePerDay = "Valid price required";
        if (!formData.category) errors.category = "Category is required";
        if (!formData.fuelType) errors.fuelType = "Fuel type is required";
        if (!formData.transmission) errors.transmission = "Transmission is required";

        // Check duplicate registration
        if (formData.registrationNumber) {
            const dup = vehicles.find(
                (v) => v.registrationNumber === formData.registrationNumber && v.id !== selectedVehicle?.id
            );
            if (dup) errors.registrationNumber = "Registration number already exists";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openAddForm = () => {
        setSelectedVehicle(null);
        setFormData({ status: "Available", fuelType: "Petrol", transmission: "Manual", year: 2024 });
        setFormErrors({});
        setFormOpen(true);
    };

    const openEditForm = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setFormData({ ...vehicle });
        setFormErrors({});
        setFormOpen(true);
    };

    const handleSave = () => {
        if (!validateForm()) return;
        if (selectedVehicle) {
            setVehicles((prev) =>
                prev.map((v) => (v.id === selectedVehicle.id ? { ...v, ...formData } as Vehicle : v))
            );
        } else {
            const newVehicle: Vehicle = {
                id: `v${Date.now()}`,
                brand: formData.brand!,
                model: formData.model!,
                year: formData.year!,
                category: formData.category as VehicleCategory,
                registrationNumber: formData.registrationNumber!,
                fuelType: formData.fuelType as FuelType,
                transmission: formData.transmission as TransmissionType,
                status: formData.status as VehicleStatus,
                pricePerDay: formData.pricePerDay!,
                imageUrl: "/vehicles/placeholder.jpg",
                mileage: formData.mileage || 0,
                color: formData.color || "White",
                createdAt: new Date().toISOString().slice(0, 10),
            };
            setVehicles((prev) => [...prev, newVehicle]);
        }
        setFormOpen(false);
    };

    const handleDelete = () => {
        if (selectedVehicle) {
            setVehicles((prev) => prev.filter((v) => v.id !== selectedVehicle.id));
        }
        setDeleteOpen(false);
        setSelectedVehicle(null);
    };

    return (
        <div>
            <PageHeader title="Vehicles" description="Manage your fleet of vehicles" icon={Car}>
                <Button onClick={openAddForm}>
                    <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                </Button>
            </PageHeader>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by brand, model, or registration..."
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
                                <SelectItem value="Available">Available</SelectItem>
                                <SelectItem value="Rented">Rented</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full sm:w-[160px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="Hatchback">Hatchback</SelectItem>
                                <SelectItem value="Sedan">Sedan</SelectItem>
                                <SelectItem value="SUV">SUV</SelectItem>
                                <SelectItem value="Luxury">Luxury</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredVehicles.length} of {vehicles.length} vehicles
                </p>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortHeader label="Vehicle" sortKeyName="brand" onClick={toggleSort} />
                                <SortHeader label="Category" sortKeyName="category" onClick={toggleSort} />
                                <TableHead>Registration</TableHead>
                                <TableHead>Fuel</TableHead>
                                <TableHead>Transmission</TableHead>
                                <SortHeader label="Price/Day" sortKeyName="pricePerDay" onClick={toggleSort} />
                                <SortHeader label="Status" sortKeyName="status" onClick={toggleSort} />
                                <TableHead className="w-[50px]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredVehicles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No vehicles found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredVehicles.map((vehicle) => (
                                    <TableRow key={vehicle.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                                    <Car className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{vehicle.brand} {vehicle.model}</p>
                                                    <p className="text-xs text-muted-foreground">{vehicle.year} • {vehicle.color}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-normal">{vehicle.category}</Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{vehicle.registrationNumber}</TableCell>
                                        <TableCell className="text-sm">{vehicle.fuelType}</TableCell>
                                        <TableCell className="text-sm">{vehicle.transmission}</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(vehicle.pricePerDay)}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={vehicle.status} variant="vehicle" />
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => { setSelectedVehicle(vehicle); setViewOpen(true); }}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditForm(vehicle)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => { setSelectedVehicle(vehicle); setDeleteOpen(true); }}
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

            {/* Add/Edit Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                        <DialogDescription>
                            {selectedVehicle ? "Update the vehicle details below." : "Fill in the vehicle details to add it to your fleet."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="brand">Brand *</Label>
                                <Input id="brand" value={formData.brand || ""} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                                {formErrors.brand && <p className="text-xs text-destructive">{formErrors.brand}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="model">Model *</Label>
                                <Input id="model" value={formData.model || ""} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
                                {formErrors.model && <p className="text-xs text-destructive">{formErrors.model}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="year">Year *</Label>
                                <Input id="year" type="number" value={formData.year || ""} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} />
                                {formErrors.year && <p className="text-xs text-destructive">{formErrors.year}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="category">Category *</Label>
                                <Select value={formData.category || ""} onValueChange={(v) => setFormData({ ...formData, category: v as VehicleCategory })}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hatchback">Hatchback</SelectItem>
                                        <SelectItem value="Sedan">Sedan</SelectItem>
                                        <SelectItem value="SUV">SUV</SelectItem>
                                        <SelectItem value="Luxury">Luxury</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formErrors.category && <p className="text-xs text-destructive">{formErrors.category}</p>}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="regNum">Registration Number *</Label>
                            <Input id="regNum" value={formData.registrationNumber || ""} onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })} placeholder="KA-01-AB-1234" />
                            {formErrors.registrationNumber && <p className="text-xs text-destructive">{formErrors.registrationNumber}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Fuel Type *</Label>
                                <Select value={formData.fuelType || ""} onValueChange={(v) => setFormData({ ...formData, fuelType: v as FuelType })}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Petrol">Petrol</SelectItem>
                                        <SelectItem value="Diesel">Diesel</SelectItem>
                                        <SelectItem value="Electric">Electric</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formErrors.fuelType && <p className="text-xs text-destructive">{formErrors.fuelType}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Transmission *</Label>
                                <Select value={formData.transmission || ""} onValueChange={(v) => setFormData({ ...formData, transmission: v as TransmissionType })}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Manual">Manual</SelectItem>
                                        <SelectItem value="Automatic">Automatic</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formErrors.transmission && <p className="text-xs text-destructive">{formErrors.transmission}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="price">Price per Day (₹) *</Label>
                                <Input id="price" type="number" value={formData.pricePerDay || ""} onChange={(e) => setFormData({ ...formData, pricePerDay: parseInt(e.target.value) })} />
                                {formErrors.pricePerDay && <p className="text-xs text-destructive">{formErrors.pricePerDay}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="color">Color</Label>
                                <Input id="color" value={formData.color || ""} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Status</Label>
                            <Select value={formData.status || "Available"} onValueChange={(v) => setFormData({ ...formData, status: v as VehicleStatus })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Available">Available</SelectItem>
                                    <SelectItem value="Rented">Rented</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Mock image upload */}
                        <div className="space-y-1.5">
                            <Label>Vehicle Image</Label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                                <Car className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>{selectedVehicle ? "Update Vehicle" : "Add Vehicle"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Vehicle Details</DialogTitle>
                    </DialogHeader>
                    {selectedVehicle && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <Car className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">{selectedVehicle.brand} {selectedVehicle.model}</p>
                                    <p className="text-sm text-muted-foreground">{selectedVehicle.year} • {selectedVehicle.color}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    ["Category", selectedVehicle.category],
                                    ["Registration", selectedVehicle.registrationNumber],
                                    ["Fuel Type", selectedVehicle.fuelType],
                                    ["Transmission", selectedVehicle.transmission],
                                    ["Price/Day", formatCurrency(selectedVehicle.pricePerDay)],
                                    ["Mileage", `${selectedVehicle.mileage} km/l`],
                                ].map(([label, value]) => (
                                    <div key={label as string}>
                                        <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
                                        <p className="font-medium">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Status</p>
                                <StatusBadge status={selectedVehicle.status} variant="vehicle" />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Vehicle</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedVehicle?.brand} {selectedVehicle?.model} ({selectedVehicle?.registrationNumber})? This action cannot be undone.
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
