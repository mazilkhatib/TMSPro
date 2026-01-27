"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
    MoreHorizontal,
    Edit,
    Flag,
    Trash2,
    Eye,
    MapPin,
    Truck,
    Package,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Shipment, ShipmentStatus, ShipmentPriority } from "@/types";

interface TileViewProps {
    shipments: Shipment[];
    onSelectShipment: (shipment: Shipment) => void;
    onEdit?: (shipment: Shipment) => void;
    onFlag?: (shipment: Shipment) => void;
    onDelete?: (shipment: Shipment) => void;
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

const statusDotColors: Record<ShipmentStatus, string> = {
    PENDING: "bg-yellow-500",
    PICKED_UP: "bg-blue-500",
    IN_TRANSIT: "bg-purple-500",
    OUT_FOR_DELIVERY: "bg-orange-500",
    DELIVERED: "bg-green-500",
    CANCELLED: "bg-red-500",
    ON_HOLD: "bg-gray-500"
};

const priorityColors: Record<ShipmentPriority, string> = {
    LOW: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
    MEDIUM: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    HIGH: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    URGENT: "bg-red-500/15 text-red-600 dark:text-red-400 animate-pulse"
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 }
};

export function TileView({
    shipments,
    onSelectShipment,
    onEdit,
    onFlag,
    onDelete,
    page,
    totalPages,
    onPageChange
}: TileViewProps) {
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
            currency: "USD",
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-2">
            <motion.div
                key={`page-${page}`}
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
            >
                {shipments.map((shipment) => (
                    <motion.div key={shipment.id} variants={item}>
                        <Card
                            className={cn(
                                "h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer",
                                shipment.flagged && "border-destructive/50 bg-destructive/5"
                            )}
                            onClick={() => onSelectShipment(shipment)}
                        >
                            <CardContent className="p-2 sm:p-5 space-y-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className={cn("font-mono", statusColors[shipment.status])}>
                                        {shipment.status.replace(/_/g, " ")}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 -mr-2 -mt-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectShipment(shipment); }}>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(shipment); }}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFlag?.(shipment); }}>
                                                <Flag className={cn("mr-2 h-4 w-4", shipment.flagged && "fill-destructive text-destructive")} />
                                                {shipment.flagged ? "Unflag" : "Flag"}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.(shipment); }} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg">{shipment.trackingNumber}</h3>
                                    <p className="text-sm text-muted-foreground">{shipment.carrierName}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Origin</p>
                                        <p className="font-medium truncate">{shipment.pickupLocation.city}, {shipment.pickupLocation.state}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Destination</p>
                                        <p className="font-medium truncate">{shipment.deliveryLocation.city}, {shipment.deliveryLocation.state}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t flex justify-between items-center text-sm">
                                    <div className="flex items-center text-muted-foreground">
                                        <Badge variant="secondary" className={cn("mr-2 text-xs", priorityColors[shipment.priority])}>
                                            {shipment.priority}
                                        </Badge>
                                    </div>
                                    <div className="font-semibold">
                                        {formatCurrency(shipment.rate)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2 pt-4 border-t border-border/40">
                <p className="text-sm text-muted-foreground font-medium">
                    Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
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
