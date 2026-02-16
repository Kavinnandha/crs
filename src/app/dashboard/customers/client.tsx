"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Users, Eye, Phone, CreditCard as License, CalendarDays,
    Plus, Pencil, Trash2, MoreHorizontal, LayoutGrid, List
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
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Customer } from "@/types";
import { deleteCustomer } from "@/lib/actions";
import Link from "next/link";


interface CustomersClientProps {
    customers: Customer[];
}

export default function CustomersClient({ customers }: CustomersClientProps) {
    const { setHeaderAction, searchTerm } = useDashboard();
    const [customersList, setCustomersList] = useState<Customer[]>(customers);

    useEffect(() => {
        setCustomersList(customers);
    }, [customers]);

    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"table" | "card">("card");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [deleting, setDeleting] = useState(false);

    const filteredCustomers = useMemo(() => {
        let result = [...customersList];
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
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
    }, [searchTerm, statusFilter, customersList]);

    // Inject action button into navbar
    useEffect(() => {
        setHeaderAction(
            <Link href="/dashboard/customers/new">
                <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl h-10 px-5 shadow-sm shadow-[#7C3AED]/20 font-medium text-sm gap-2 whitespace-nowrap">
                    <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Customer</span>
                </Button>
            </Link>
        );
        return () => setHeaderAction(null);
    }, [setHeaderAction]);

    const handleDelete = async () => {
        if (customerToDelete) {
            setDeleting(true);
            try {
                const result = await deleteCustomer(customerToDelete.id);
                if (result.success) {
                    setDeleteOpen(false);
                    setCustomerToDelete(null);
                } else {
                    setDeleteOpen(false);
                    setAlertMessage(result.message || "An error occurred.");
                    setAlertOpen(true);
                }
            } catch (error) {
                setDeleteOpen(false);
                setAlertMessage("An unexpected error occurred");
                setAlertOpen(true);
            } finally {
                setDeleting(false);
            }
        }
    };

    const confirmDelete = (customer: Customer) => {
        setCustomerToDelete(customer);
        setDeleteOpen(true);
    };

    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    const filtersContent = (
        <div className="flex flex-wrap items-center gap-2 justify-end">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] sm:w-[150px] h-9 rounded-xl border-[#E8E5F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#64748B] dark:text-slate-300 shadow-none focus:ring-[#7C3AED]/20">
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border shadow-lg">
                    <SelectItem value="all" className="rounded-lg">All Status</SelectItem>
                    <SelectItem value="Verified" className="rounded-lg">Verified</SelectItem>
                    <SelectItem value="Pending" className="rounded-lg">Pending</SelectItem>
                    <SelectItem value="Rejected" className="rounded-lg">Rejected</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex items-center gap-0.5 ml-1 bg-muted rounded-xl p-0.5 border border-border">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("table")}
                    title="List View"
                    className={`h-8 w-8 rounded-lg ${viewMode === "table" ? "bg-white dark:bg-slate-700 shadow-sm text-[#7C3AED]" : "text-[#94a3b8] hover:text-[#64748B]"}`}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("card")}
                    title="Grid View"
                    className={`h-8 w-8 rounded-lg ${viewMode === "card" ? "bg-white dark:bg-slate-700 shadow-sm text-[#7C3AED]" : "text-[#94a3b8] hover:text-[#64748B]"}`}
                >
                    <LayoutGrid className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <div>
            <PageHeader
                title="Management"
                description="View and manage customer records"
                breadcrumb={["Dashboard", "Customers"]}
                filters={filtersContent}
            />

            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-[#94a3b8] font-medium">
                    {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""} found
                </p>
            </div>

            {viewMode === "table" ? (
                <Card className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 border-border">
                                    <TableHead className="font-semibold text-[#64748B]">Customer</TableHead>
                                    <TableHead className="font-semibold text-[#64748B]">Phone</TableHead>
                                    <TableHead className="font-semibold text-[#64748B]">License No.</TableHead>
                                    <TableHead className="font-semibold text-[#64748B]">Verification</TableHead>
                                    <TableHead className="font-semibold text-[#64748B]">Joined</TableHead>
                                    <TableHead className="w-[80px]" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-[#94a3b8]">
                                            No customers found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <TableRow key={customer.id} className="border-border hover:bg-muted/30">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-border">
                                                        <AvatarFallback className="text-xs bg-[#7C3AED]/10 text-[#7C3AED] font-bold">
                                                            {getInitials(customer.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <Link href={`/dashboard/customers/${customer.id}`} className="hover:underline">
                                                            <p className="font-medium text-sm text-[#1a1d2e] dark:text-white">{customer.name}</p>
                                                        </Link>
                                                        <p className="text-xs text-[#94a3b8]">{customer.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-[#1a1d2e] dark:text-slate-200">{customer.phone}</TableCell>
                                            <TableCell className="font-mono text-xs text-[#64748B]">{customer.drivingLicenseNumber}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={customer.verificationStatus} variant="verification" />
                                            </TableCell>
                                            <TableCell className="text-sm text-[#94a3b8]">
                                                {new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#94a3b8] hover:text-[#64748B] hover:bg-[#F8F9FC] dark:hover:bg-slate-800 rounded-lg">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl border-border shadow-lg">
                                                        <Link href={`/dashboard/customers/${customer.id}`}>
                                                            <DropdownMenuItem className="rounded-lg cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4" /> View Profile
                                                            </DropdownMenuItem>
                                                        </Link>
                                                        <Link href={`/dashboard/customers/${customer.id}/edit`}>
                                                            <DropdownMenuItem className="rounded-lg cursor-pointer">
                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                        </Link>
                                                        <DropdownMenuSeparator className="bg-border" />
                                                        <DropdownMenuItem
                                                            className="text-red-500 hover:text-red-600 rounded-lg cursor-pointer"
                                                            onClick={() => confirmDelete(customer)}
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
                    {filteredCustomers.map((customer) => (
                        <Card key={customer.id} className="group relative overflow-hidden transition-all hover:shadow-md border border-border rounded-2xl">
                            <CardContent className="p-6">
                                <div className="absolute top-4 right-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#94a3b8] hover:text-[#64748B] hover:bg-[#F8F9FC] dark:hover:bg-slate-800 rounded-lg">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl border-border shadow-lg">
                                            <Link href={`/dashboard/customers/${customer.id}`}>
                                                <DropdownMenuItem className="rounded-lg cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4" /> View Profile
                                                </DropdownMenuItem>
                                            </Link>
                                            <Link href={`/dashboard/customers/${customer.id}/edit`}>
                                                <DropdownMenuItem className="rounded-lg cursor-pointer">
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuSeparator className="bg-border" />
                                            <DropdownMenuItem
                                                className="text-red-500 hover:text-red-600 rounded-lg cursor-pointer"
                                                onClick={() => confirmDelete(customer)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="h-20 w-20 mb-4 border-4 border-background shadow-sm ring-1 ring-border">
                                        <AvatarFallback className="text-2xl bg-[#7C3AED]/10 text-[#7C3AED] font-bold">
                                            {getInitials(customer.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Link href={`/dashboard/customers/${customer.id}`} className="hover:underline">
                                        <h3 className="font-semibold text-lg text-[#1a1d2e] dark:text-white">{customer.name}</h3>
                                    </Link>
                                    <p className="text-sm text-[#94a3b8] mb-3">{customer.email}</p>
                                    <div className="mb-4">
                                        <StatusBadge status={customer.verificationStatus} variant="verification" />
                                    </div>
                                    <div className="w-full space-y-3 mt-2 pt-4 border-t border-border text-sm">
                                        <div className="flex items-center justify-between text-[#94a3b8]">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span>Phone</span>
                                            </div>
                                            <span className="text-[#1a1d2e] dark:text-slate-200 font-medium">{customer.phone}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[#94a3b8]">
                                            <div className="flex items-center gap-2">
                                                <License className="h-3.5 w-3.5" />
                                                <span>License</span>
                                            </div>
                                            <span className="text-[#1a1d2e] dark:text-slate-200 font-medium font-mono text-xs">{customer.drivingLicenseNumber}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[#94a3b8]">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                <span>Joined</span>
                                            </div>
                                            <span className="text-[#1a1d2e] dark:text-slate-200 font-medium text-xs">
                                                {new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        </div>
                                    </div>
                                    <Link href={`/dashboard/customers/${customer.id}`} className="w-full">
                                        <Button variant="outline" className="w-full mt-4 rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-muted">
                                            View Profile
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredCustomers.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-muted/50">
                            <Users className="h-10 w-10 mb-3 text-[#94a3b8]/50" />
                            <p className="font-medium">No customers found.</p>
                            <p className="text-sm">Try adjusting your filters or search.</p>
                        </div>
                    )}
                </div>
            )}

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-sm rounded-2xl border-border shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-[#1a1d2e] dark:text-white text-lg font-semibold">Delete Customer</DialogTitle>
                        <DialogDescription className="text-[#94a3b8]">
                            Are you sure you want to delete {customerToDelete?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl border-border text-muted-foreground hover:bg-muted shadow-none" disabled={deleting}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} className="rounded-xl shadow-sm" disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
                <DialogContent className="max-w-m rounded-2xl border-border shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-[#1a1d2e] dark:text-white text-lg font-semibold flex items-center gap-2">
                            <span className="text-amber-500">⚠️</span> Cannot Delete Customer
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
