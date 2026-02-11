"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ResponsiveTableProps {
    headers: string[];
    children: ReactNode;
    mobileCards?: ReactNode;
    className?: string;
}

export function ResponsiveTable({
    headers,
    children,
    mobileCards,
    className = "",
}: ResponsiveTableProps) {
    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
                <Card className={className}>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {headers.map((header, idx) => (
                                        <TableHead key={idx}>{header}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>{children}</TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile Card View */}
            {mobileCards && <div className="md:hidden space-y-3">{mobileCards}</div>}
        </>
    );
}
