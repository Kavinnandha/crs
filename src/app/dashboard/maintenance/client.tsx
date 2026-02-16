"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus,
  AlertTriangle,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useDashboard } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MaintenanceRecord, Vehicle, ServiceType } from "@/types";
import { deleteMaintenance } from "@/lib/actions";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils"; // Assuming utils has it, else redefine

const serviceTypes: ServiceType[] = [
  "Oil Change",
  "Tire Replacement",
  "Brake Service",
  "Engine Repair",
  "AC Service",
  "General Service",
  "Body Repair",
  "Battery Replacement",
];

interface MaintenanceClientProps {
  initialRecords: MaintenanceRecord[];
  vehicles: Vehicle[];
}

export default function MaintenanceClient({
  initialRecords,
  vehicles,
}: MaintenanceClientProps) {
  const { setHeaderAction, searchTerm } = useDashboard();
  const [records, setRecords] = useState<MaintenanceRecord[]>(initialRecords);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [currentTime] = useState(() => Date.now());

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] =
    useState<MaintenanceRecord | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Sync records if initialRecords updates
  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  // Helper to get vehicle details
  const getVehicleDetails = useCallback(
    (vehicleId: string) => {
      return vehicles.find((v) => v.id === vehicleId);
    },
    [vehicles],
  );

  // Inject action button into navbar
  useEffect(() => {
    setHeaderAction(
      <Link href="/dashboard/maintenance/new">
        <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl h-10 px-3 md:px-5 shadow-sm shadow-[#7C3AED]/20 font-medium text-sm gap-2">
          <Plus className="h-4 w-4" />{" "}
          <span className="hidden md:inline">Add Record</span>
        </Button>
      </Link>,
    );
    return () => setHeaderAction(null);
  }, [setHeaderAction]);

  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((r) => {
        const vehicle = getVehicleDetails(r.vehicleId);
        return (
          r.serviceType.toLowerCase().includes(q) ||
          r.vendor.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (vehicle ? `${vehicle.brand} ${vehicle.model}` : "")
            .toLowerCase()
            .includes(q)
        );
      });
    }

    if (serviceFilter !== "all") {
      result = result.filter((r) => r.serviceType === serviceFilter);
    }
    return result.sort(
      (a, b) =>
        new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime(),
    );
  }, [records, serviceFilter, searchTerm, getVehicleDetails]);

  const upcomingServices = records
    .filter(
      (r) =>
        r.nextServiceDate &&
        new Date(r.nextServiceDate).getTime() <= currentTime + 30 * 86400000,
    )
    .sort(
      (a, b) =>
        (a.nextServiceDate ? new Date(a.nextServiceDate).getTime() : 0) -
        (b.nextServiceDate ? new Date(b.nextServiceDate).getTime() : 0),
    );

  const totalCost = records.reduce((s, r) => s + r.cost, 0);

  const handleDelete = async () => {
    if (recordToDelete) {
      try {
        const result = await deleteMaintenance(recordToDelete.id);
        if (result && result.success) {
          setDeleteOpen(false);
          setRecordToDelete(null);
        } else {
          setDeleteOpen(false);
          setAlertMessage(
            result?.message || "Failed to delete maintenance record",
          );
          setAlertOpen(true);
        }
      } catch (error) {
        console.error("Failed to delete", error);
        setDeleteOpen(false);
        setAlertMessage("An unexpected error occurred");
        setAlertOpen(true);
      }
    }
  };

  // Filters component for inline rendering
  const filtersContent = (
    <div className="flex items-center gap-2">
      <Select value={serviceFilter} onValueChange={setServiceFilter}>
        <SelectTrigger className="w-[160px] h-9 rounded-xl border-border bg-background text-sm text-muted-foreground shadow-none focus:ring-ring/20">
          <SelectValue placeholder="Service Type" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border shadow-lg">
          <SelectItem value="all" className="rounded-lg">
            All Types
          </SelectItem>
          {serviceTypes.map((t) => (
            <SelectItem key={t} value={t} className="rounded-lg">
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Track vehicle servicing and repair records"
        breadcrumb={["Dashboard", "Maintenance"]}
        filters={filtersContent}
      />

      {/* Upcoming Service Reminders */}
      {upcomingServices.length > 0 && (
        <Card className="mb-6 border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-amber-700">
                Upcoming Service Reminders
              </h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingServices.map((r) => {
                const v = getVehicleDetails(r.vehicleId);
                const daysUntil = r.nextServiceDate
                  ? Math.ceil(
                      (new Date(r.nextServiceDate).getTime() - currentTime) /
                        86400000,
                    )
                  : 0;
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3"
                  >
                    <Calendar className="h-4 w-4 text-amber-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {v ? `${v.brand} ${v.model}` : "Unknown"} —{" "}
                        {r.serviceType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {daysUntil <= 0
                          ? "Overdue"
                          : `Due in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        daysUntil <= 7
                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }
                    >
                      {r.nextServiceDate
                        ? new Date(r.nextServiceDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short" },
                          )
                        : ""}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">
          {filteredRecords.length} records
        </p>
        <p className="text-sm font-medium">
          Total Maintenance Cost: {formatCurrency(totalCost)}
        </p>
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
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const vehicle = getVehicleDetails(record.vehicleId);
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">
                            {vehicle
                              ? `${vehicle.brand} ${vehicle.model}`
                              : "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vehicle?.registrationNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {record.serviceType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(record.serviceDate).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{record.vendor}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(record.cost)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.nextServiceDate
                          ? new Date(record.nextServiceDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#94a3b8] hover:text-[#64748B] hover:bg-[#F8F9FC] dark:hover:bg-slate-800 rounded-lg"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl border-border shadow-lg"
                          >
                            <Link
                              href={`/dashboard/maintenance/${record.id}/edit`}
                            >
                              <DropdownMenuItem className="rounded-lg cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              className="text-red-500 hover:text-red-600 rounded-lg cursor-pointer"
                              onClick={() => {
                                setRecordToDelete(record);
                                setDeleteOpen(true);
                              }}
                            >
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

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm rounded-2xl border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-[#1a1d2e] dark:text-white text-lg font-semibold">
              Delete Record
            </DialogTitle>
            <DialogDescription className="text-[#94a3b8]">
              Are you sure you want to delete this maintenance record? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="rounded-xl border-border text-muted-foreground hover:bg-muted shadow-none"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-xl shadow-sm"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent className="max-w-m rounded-2xl border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-[#1a1d2e] dark:text-white text-lg font-semibold flex items-center gap-2">
              <span className="text-amber-500">⚠️</span> Cannot Delete Record
            </DialogTitle>
            <DialogDescription className="text-[#64748B] text-base pt-2">
              {alertMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setAlertOpen(false)}
              className="rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            >
              Okay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
