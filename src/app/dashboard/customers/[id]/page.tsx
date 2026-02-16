import { PageHeader } from "@/components/layout/page-header";
import { getCustomerById, getBookings, getVehicles } from "@/lib/data";
import { notFound } from "next/navigation";
import { Booking, Vehicle } from "@/types";
import { StatusBadge } from "@/components/tables/status-badge";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil, ArrowLeft, Mail, Phone, MapPin, CreditCard, CalendarDays, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageViewer } from "@/components/ui/image-viewer";

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const customer = await getCustomerById(id);

    if (!customer) {
        notFound();
    }

    const allBookings = await getBookings();
    const allVehicles = await getVehicles();
    const vehicleMap = new Map<string, Vehicle>(allVehicles.map((v: Vehicle) => [v.id, v]));

    const customerBookings = allBookings
        .filter((b: Booking) => b.customerId === customer.id)
        .sort((a: Booking, b: Booking) => new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime());

    const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <PageHeader
                    title={customer.name}
                    description="Customer Profile & History"
                    breadcrumb={["Dashboard", "Customers", customer.name]}
                />
                <div className="flex gap-2">
                    <Link href="/dashboard/customers">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Customers
                        </Button>
                    </Link>
                    <Link href={`/dashboard/customers/${customer.id}/edit`}>
                        <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white gap-2">
                            <Pencil className="h-4 w-4" /> Edit Profile
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="lg:col-span-1 shadow-sm border-[#E8E5F0] dark:border-slate-800 overflow-hidden">
                    <div className="bg-linear-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 p-6 flex flex-col items-center border-b border-[#E8E5F0] dark:border-slate-800">
                        <Avatar className="h-24 w-24 mb-4 border-4 border-white dark:border-slate-800 shadow-sm">
                            <AvatarFallback className="text-3xl bg-[#7C3AED] text-white font-bold">
                                {getInitials(customer.name)}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="font-semibold text-xl text-[#1a1d2e] dark:text-white">{customer.name}</h2>
                        <div className="mt-2">
                            <StatusBadge status={customer.verificationStatus} variant="verification" />
                        </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 border border-[#E8E5F0] dark:border-slate-700">
                            <Mail className="h-4 w-4 text-[#7C3AED] shrink-0" />
                            <span className="text-sm truncate font-medium text-[#1a1d2e] dark:text-slate-200">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 border border-[#E8E5F0] dark:border-slate-700">
                            <Phone className="h-4 w-4 text-[#7C3AED] shrink-0" />
                            <span className="text-sm font-medium text-[#1a1d2e] dark:text-slate-200">{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 border border-[#E8E5F0] dark:border-slate-700">
                            <MapPin className="h-4 w-4 text-[#7C3AED] shrink-0" />
                            <span className="text-sm font-medium text-[#1a1d2e] dark:text-slate-200 truncate">{customer.address || "No address provided"}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 border border-[#E8E5F0] dark:border-slate-700">
                            <CreditCard className="h-4 w-4 text-[#7C3AED] shrink-0" />
                            <span className="text-sm font-mono font-medium text-[#1a1d2e] dark:text-slate-200">{customer.drivingLicenseNumber}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 border border-[#E8E5F0] dark:border-slate-700">
                            <CalendarDays className="h-4 w-4 text-[#7C3AED] shrink-0" />
                            <span className="text-sm font-medium text-[#1a1d2e] dark:text-slate-200">Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Identity Documents */}
                {(customer.aadharImageUrl || customer.drivingLicenseImageUrl) && (
                    <Card className="lg:col-span-3 shadow-sm border-[#E8E5F0] dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#7C3AED]" />
                                Identity Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {customer.aadharImageUrl && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-[#64748B] dark:text-slate-400">Aadhar Card</p>
                                        <ImageViewer
                                            src={customer.aadharImageUrl}
                                            alt="Aadhar Card"
                                            className="h-52 w-full"
                                        />
                                    </div>
                                )}
                                {customer.drivingLicenseImageUrl && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-[#64748B] dark:text-slate-400">Driving License</p>
                                        <ImageViewer
                                            src={customer.drivingLicenseImageUrl}
                                            alt="Driving License"
                                            className="h-52 w-full"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Rental History */}
                <Card className="lg:col-span-2 shadow-sm border-[#E8E5F0] dark:border-slate-800 h-fit">
                    <CardHeader>
                        <CardTitle>Rental History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {customerBookings.length === 0 ? (
                            <div className="text-center py-12 text-[#94a3b8]">
                                Use the booking system to create new rentals.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-[#E8E5F0] dark:border-slate-800 bg-[#F8F9FC] dark:bg-slate-800/50 hover:bg-[#F8F9FC] dark:hover:bg-slate-800/50">
                                        <TableHead className="text-[#64748B]">Vehicle</TableHead>
                                        <TableHead className="text-[#64748B]">Dates</TableHead>
                                        <TableHead className="text-[#64748B]">Status</TableHead>
                                        <TableHead className="text-right text-[#64748B]">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customerBookings.map((booking: Booking) => {
                                        const vehicle = vehicleMap.get(booking.vehicleId);
                                        return (
                                            <TableRow key={booking.id} className="border-[#E8E5F0] dark:border-slate-800 hover:bg-[#F8F9FC] dark:hover:bg-slate-800/30">
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-sm text-[#1a1d2e] dark:text-white">
                                                            {vehicle ? `${vehicle.brand} ${vehicle.model}` : "Unknown Vehicle"}
                                                        </p>
                                                        <p className="text-xs text-[#94a3b8]">
                                                            {vehicle?.registrationNumber || "N/A"}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-[#1a1d2e] dark:text-slate-200">
                                                        {new Date(booking.pickupDate).toLocaleDateString()}
                                                        <span className="text-[#94a3b8] px-1">→</span>
                                                        {new Date(booking.dropDate).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={booking.status} variant="booking" />
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-[#1a1d2e] dark:text-white">
                                                    {formatCurrency(booking.totalAmount)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
