"use client";

import { useState, useMemo } from "react";
import {
    Wrench, Plus, Search, AlertTriangle, Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
    maintenanceRecords as initialRecords, vehicles, getVehicleById, formatCurrency,
} from "@/lib/mock-data";
import { MaintenanceRecord, ServiceType } from "@/types";

const serviceTypes: ServiceType[] = [
    "Oil Change", "Tire Replacement", "Brake Service", "Engine Repair",
    "AC Service", "General Service", "Body Repair", "Battery Replacement",
];

export default function MaintenancePage() {
    const [records, setRecords] = useState<MaintenanceRecord[]>(initialRecords);
    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("all");
    const [addOpen, setAddOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [currentTime] = useState(() => Date.now()); // Initialize once during mount

    const filteredRecords = useMemo(() => {
        let result = [...records];
        if (search) {
            const q = search.toLowerCase();
            result = result.filter((r) => {
                const v = getVehicleById(r.vehicleId);
                return (
                    v?.brand.toLowerCase().includes(q) ||
                    v?.model.toLowerCase().includes(q) ||
                    r.vendor.toLowerCase().includes(q) ||
                    r.description.toLowerCase().includes(q)
                );
            });
        }
        if (serviceFilter !== "all") {
            result = result.filter((r) => r.serviceType === serviceFilter);
        }
        return result.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
    }, [records, search, serviceFilter]);

    const upcomingServices = records
        .filter((r) => new Date(r.nextServiceDate) <= new Date(currentTime + 30 * 86400000))
        .sort((a, b) => new Date(a.nextServiceDate).getTime() - new Date(b.nextServiceDate).getTime());

    const totalCost = records.reduce((s, r) => s + r.cost, 0);

    const handleAddRecord = () => {
        const errors: Record<string, string> = {};
        if (!formData.vehicleId) errors.vehicleId = "Vehicle is required";
        if (!formData.serviceType) errors.serviceType = "Service type is required";
        if (!formData.serviceDate) errors.serviceDate = "Service date is required";
        if (!formData.cost || formData.cost <= 0) errors.cost = "Valid cost required";
        if (!formData.vendor?.trim()) errors.vendor = "Vendor is required";
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const newRecord: MaintenanceRecord = {
            id: `m${Date.now()}`,
            vehicleId: formData.vehicleId!,
            serviceType: formData.serviceType as ServiceType,
            serviceDate: formData.serviceDate!,
            cost: formData.cost!,
            description: formData.description || "",
            nextServiceDate: formData.nextServiceDate || "",
            vendor: formData.vendor!,
        };
        setRecords((prev) => [newRecord, ...prev]);
        setAddOpen(false);
    };

    return (
        <div>
            <PageHeader title="Maintenance" description="Track vehicle servicing and repair records" icon={Wrench}>
                <Button onClick={() => { setFormData({}); setFormErrors({}); setAddOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Record
                </Button>
            </PageHeader>

            {/* Upcoming Service Reminders */}
            {upcomingServices.length > 0 && (
                <Card className="mb-6 border-amber-500/20 bg-amber-500/5">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <h3 className="text-sm font-semibold text-amber-700">Upcoming Service Reminders</h3>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {upcomingServices.map((r) => {
                                const v = getVehicleById(r.vehicleId);
                                const daysUntil = Math.ceil(
                                    (new Date(r.nextServiceDate).getTime() - currentTime) / 86400000
                                );
                                return (
                                    <div key={r.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                                        <Calendar className="h-4 w-4 text-amber-600 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {v ? `${v.brand} ${v.model}` : "Unknown"} — {r.serviceType}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {daysUntil <= 0 ? "Overdue" : `Due in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className={daysUntil <= 7 ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                                            {new Date(r.nextServiceDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search by vehicle, vendor, or description..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                        <Select value={serviceFilter} onValueChange={setServiceFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Service Type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {serviceTypes.map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">{filteredRecords.length} records</p>
                <p className="text-sm font-medium">Total Maintenance Cost: {formatCurrency(totalCost)}</p>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Service Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead>Next Service</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No records found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredRecords.map((record) => {
                                    const vehicle = getVehicleById(record.vehicleId);
                                    return (
                                        <TableRow key={record.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium">{vehicle ? `${vehicle.brand} ${vehicle.model}` : "Unknown"}</p>
                                                    <p className="text-xs text-muted-foreground">{vehicle?.registrationNumber}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal">{record.serviceType}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(record.serviceDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </TableCell>
                                            <TableCell className="text-sm">{record.vendor}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(record.cost)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {record.nextServiceDate
                                                    ? new Date(record.nextServiceDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                                    : "—"}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Record Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Maintenance Record</DialogTitle>
                        <DialogDescription>Log a new service or repair for a vehicle.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-1.5">
                            <Label>Vehicle *</Label>
                            <Select value={formData.vehicleId || ""} onValueChange={(v) => setFormData({ ...formData, vehicleId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                                <SelectContent>
                                    {vehicles.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>{v.brand} {v.model} — {v.registrationNumber}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formErrors.vehicleId && <p className="text-xs text-destructive">{formErrors.vehicleId}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Service Type *</Label>
                                <Select value={formData.serviceType || ""} onValueChange={(v) => setFormData({ ...formData, serviceType: v as ServiceType })}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {serviceTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                                {formErrors.serviceType && <p className="text-xs text-destructive">{formErrors.serviceType}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Service Date *</Label>
                                <Input type="date" value={formData.serviceDate || ""} onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })} />
                                {formErrors.serviceDate && <p className="text-xs text-destructive">{formErrors.serviceDate}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Cost (₹) *</Label>
                                <Input type="number" value={formData.cost || ""} onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })} />
                                {formErrors.cost && <p className="text-xs text-destructive">{formErrors.cost}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Next Service Date</Label>
                                <Input type="date" value={formData.nextServiceDate || ""} onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Vendor *</Label>
                            <Input value={formData.vendor || ""} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} placeholder="Service center name" />
                            {formErrors.vendor && <p className="text-xs text-destructive">{formErrors.vendor}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Details of the service performed..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddRecord}>Save Record</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
