"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit,
    Flag,
    Trash2,
    Eye,
    MoreHorizontal
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shipment, ShipmentStatus, ShipmentPriority } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface GridViewProps {
    shipments: Shipment[];
    onSelectShipment: (shipment: Shipment) => void;
    onEdit?: (shipment: Shipment) => void;
    onFlag?: (shipment: Shipment) => void;
    onDelete?: (shipment: Shipment) => void;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSort?: (field: string) => void;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const statusColors: Record<ShipmentStatus, string> = {
    PENDING: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    PICKED_UP: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    IN_TRANSIT: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    OUT_FOR_DELIVERY: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
    DELIVERED: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    CANCELLED: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    ON_HOLD: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30"
};

const priorityColors: Record<ShipmentPriority, string> = {
    LOW: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
    MEDIUM: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    HIGH: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    URGENT: "bg-red-500/15 text-red-600 dark:text-red-400"
};

interface SortableHeaderProps {
    children: React.ReactNode;
    field: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSort?: (field: string) => void;
}

function SortableHeader({ children, field, sortBy, sortOrder, onSort }: SortableHeaderProps) {
    const isActive = sortBy === field;

    return (
        <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => onSort?.(field)}
        >
            <span>{children}</span>
            {isActive ? (
                sortOrder === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                ) : (
                    <ArrowDown className="ml-2 h-4 w-4" />
                )
            ) : (
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
        </Button>
    );
}

export function GridView({
    shipments,
    onSelectShipment,
    onEdit,
    onFlag,
    onDelete,
    sortBy,
    sortOrder,
    onSort,
    page,
    totalPages,
    onPageChange
}: GridViewProps) {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(amount);
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden w-full max-w-[calc(100vw-3rem)] sm:max-w-full">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-border/50">
                            <TableHead className="w-[120px]">
                                <SortableHeader field="trackingNumber" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                                    Tracking #
                                </SortableHeader>
                            </TableHead>
                            <TableHead>
                                <SortableHeader field="shipperName" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                                    Shipper
                                </SortableHeader>
                            </TableHead>
                            <TableHead>
                                <SortableHeader field="carrierName" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                                    Carrier
                                </SortableHeader>
                            </TableHead>
                            <TableHead>Origin</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>
                                <SortableHeader field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                                    Status
                                </SortableHeader>
                            </TableHead>
                            <TableHead>
                                <SortableHeader field="priority" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                                    Priority
                                </SortableHeader>
                            </TableHead>
                            <TableHead className="text-right">
                                <SortableHeader field="rate" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                                    Rate
                                </SortableHeader>
                            </TableHead>
                            <TableHead className="text-right">
                                <SortableHeader field="weight" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                                    Weight (lbs)
                                </SortableHeader>
                            </TableHead>
                            <TableHead className="text-right w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shipments.map((shipment, index) => (
                            <motion.tr
                                key={shipment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.02 }}
                                className={cn(
                                    "border-b border-border/30 transition-colors cursor-pointer",
                                    "hover:bg-accent/50",
                                    shipment.flagged && "bg-destructive/5"
                                )}
                                onClick={() => onSelectShipment(shipment)}
                            >
                                <TableCell className="font-mono text-xs font-medium">
                                    {shipment.trackingNumber.slice(0, 12)}
                                </TableCell>
                                <TableCell className="font-medium">{shipment.shipperName}</TableCell>
                                <TableCell>{shipment.carrierName}</TableCell>
                                <TableCell className="text-sm">
                                    {shipment.pickupLocation.city}, {shipment.pickupLocation.state}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {shipment.deliveryLocation.city}, {shipment.deliveryLocation.state}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("text-xs font-medium", statusColors[shipment.status])}>
                                        {shipment.status.replace(/_/g, " ")}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={cn("text-xs", priorityColors[shipment.priority])}>
                                        {shipment.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(shipment.rate)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {shipment.weight.toLocaleString()}
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onSelectShipment(shipment)}>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>

                                            {isAdmin && (
                                                <>
                                                    <DropdownMenuItem onClick={() => onEdit?.(shipment)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onFlag?.(shipment)}>
                                                        <Flag className={cn("mr-2 h-4 w-4", shipment.flagged && "fill-destructive text-destructive")} />
                                                        {shipment.flagged ? "Unflag" : "Flag"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onDelete?.(shipment)} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(1)}
                        disabled={page === 1}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(totalPages)}
                        disabled={page === totalPages}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
