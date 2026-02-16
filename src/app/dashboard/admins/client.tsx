"use client";

import { useState, useEffect } from "react";
import { Plus, Shield, ShieldCheck, Trash2, MoreHorizontal, Pencil } from "lucide-react";
import { useDashboard } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteAdmin } from "@/lib/actions/admin";
import Link from "next/link";

interface Admin {
    _id: string;
    name: string;
    email: string;
    role: "superadmin" | "admin";
    createdAt: string;
}

interface AdminsClientProps {
    admins: Admin[];
}

export default function AdminsClient({ admins: initialAdmins }: AdminsClientProps) {
    const { setHeaderAction, searchTerm } = useDashboard();
    const [originalAdmins, setOriginalAdmins] = useState<Admin[]>(initialAdmins);
    const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setOriginalAdmins(initialAdmins);
    }, [initialAdmins]);

    useEffect(() => {
        let result = [...originalAdmins];
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(
                (a) =>
                    a.name.toLowerCase().includes(q) ||
                    a.email.toLowerCase().includes(q)
            );
        }
        setAdmins(result);
    }, [originalAdmins, searchTerm]);

    useEffect(() => {
        setHeaderAction(
            <Link href="/dashboard/admins/new">
                <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl h-10 px-5 shadow-sm shadow-[#7C3AED]/20 font-medium text-sm gap-2 whitespace-nowrap">
                    <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Admin</span>
                </Button>
            </Link>
        );
        return () => setHeaderAction(null);
    }, [setHeaderAction]);

    const handleDelete = async () => {
        if (!adminToDelete) return;
        setDeleting(true);
        setError(null);
        try {
            await deleteAdmin(adminToDelete._id);
            setAdmins((prev) => prev.filter((a) => a._id !== adminToDelete._id));
            setDeleteOpen(false);
            setAdminToDelete(null);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to delete admin");
        }
        setDeleting(false);
    };

    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div>
            <PageHeader
                title="Admin Management"
                description="Manage admin accounts and access"
                breadcrumb={["Dashboard", "Admins"]}
            />

            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground font-medium">
                    {admins.length} admin{admins.length !== 1 ? "s" : ""} found
                </p>
            </div>

            <Card className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 border-border">
                                <TableHead className="font-semibold text-[#64748B] dark:text-slate-400">Admin</TableHead>
                                <TableHead className="font-semibold text-[#64748B] dark:text-slate-400">Email</TableHead>
                                <TableHead className="font-semibold text-[#64748B] dark:text-slate-400">Role</TableHead>
                                <TableHead className="font-semibold text-[#64748B] dark:text-slate-400">Joined</TableHead>
                                <TableHead className="w-[80px]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admins.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        No admins found. Create your first admin.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                admins.map((admin) => (
                                    <TableRow key={admin._id} className="border-border hover:bg-muted/30">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-border">
                                                    <AvatarFallback className="text-xs bg-[#7C3AED]/10 text-[#7C3AED] font-bold">
                                                        {getInitials(admin.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <p className="font-medium text-sm text-[#1a1d2e] dark:text-white">{admin.name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-[#64748B] dark:text-slate-400">{admin.email}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    admin.role === "superadmin"
                                                        ? "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800"
                                                        : "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                                }
                                            >
                                                {admin.role === "superadmin" ? (
                                                    <ShieldCheck className="mr-1 h-3 w-3" />
                                                ) : (
                                                    <Shield className="mr-1 h-3 w-3" />
                                                )}
                                                {admin.role === "superadmin" ? "Super Admin" : "Admin"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-[#94a3b8]">
                                            {new Date(admin.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-[#94a3b8] hover:text-[#64748B] dark:hover:text-slate-300 hover:bg-[#F8F9FC] dark:hover:bg-slate-800 rounded-lg"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border-border shadow-lg">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/admins/${admin._id}/edit`} className="cursor-pointer flex items-center w-full">
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-500 hover:text-red-600 rounded-lg cursor-pointer"
                                                        onClick={() => {
                                                            setAdminToDelete(admin);
                                                            setDeleteOpen(true);
                                                            setError(null);
                                                        }}
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

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-sm rounded-2xl border-border shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-[#1a1d2e] dark:text-white text-lg font-semibold">Delete Admin</DialogTitle>
                        <DialogDescription className="text-[#94a3b8]">
                            Are you sure you want to delete {adminToDelete?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                            {error}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                            className="rounded-xl border-border text-muted-foreground hover:bg-muted shadow-none"
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="rounded-xl shadow-sm">
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
