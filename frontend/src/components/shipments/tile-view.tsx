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
            day: "numeric"
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
        <div className="space-y-6">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
                {shipments.map((shipment) => (
                    <motion.div key={shipment.id} variants={item}>
                        <Card
                            className={cn(
                                "group relative overflow-hidden transition-all duration-300 cursor-pointer",
                                "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
                                "bg-gradient-to-br from-card to-card/80",
                                "border border-border/50 hover:border-primary/30",
                                shipment.flagged && "ring-2 ring-destructive/30 bg-destructive/5"
                            )}
                            onClick={() => onSelectShipment(shipment)}
                        >
                            {/* Priority & Status Header */}
                            <div className="flex items-center justify-between p-4 pb-0">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", statusDotColors[shipment.status])} />
                                    <Badge
                                        variant="outline"
                                        className={cn("text-xs font-medium", statusColors[shipment.status])}
                                    >
                                        {shipment.status.replace(/_/g, " ")}
                                    </Badge>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectShipment(shipment); }}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(shipment); }}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Shipment
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFlag?.(shipment); }}>
                                            <Flag className={cn("mr-2 h-4 w-4", shipment.flagged && "fill-destructive text-destructive")} />
                                            {shipment.flagged ? "Unflag" : "Flag"} Shipment
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={(e) => { e.stopPropagation(); onDelete?.(shipment); }}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <CardContent className="p-4 space-y-3">
                                {/* Tracking & Priority */}
                                <div className="space-y-1">
                                    <p className="font-mono text-xs text-muted-foreground">
                                        {shipment.trackingNumber}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold truncate">{shipment.shipperName}</h3>
                                        <Badge variant="secondary" className={cn("text-[10px] ml-auto", priorityColors[shipment.priority])}>
                                            {shipment.priority}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Route */}
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-muted-foreground truncate">
                                            {shipment.pickupLocation.city}, {shipment.pickupLocation.state}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                        <span className="text-muted-foreground truncate">
                                            {shipment.deliveryLocation.city}, {shipment.deliveryLocation.state}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Truck className="h-3.5 w-3.5" />
                                        <span className="truncate max-w-[80px]">{shipment.carrierName}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {formatDate(shipment.estimatedDelivery)}
                                    </div>
                                </div>

                                {/* Rate Badge */}
                                <div className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Badge variant="secondary" className="text-xs font-medium bg-primary/10 text-primary">
                                        {formatCurrency(shipment.rate)}
                                    </Badge>
                                </div>
                            </CardContent>

                            {/* Hover Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

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
