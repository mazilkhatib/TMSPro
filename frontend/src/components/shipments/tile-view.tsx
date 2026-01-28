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
import { useAuth } from "@/hooks/useAuth";

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
                                "group relative h-full overflow-hidden cursor-pointer transition-all duration-300",
                                "bg-gradient-to-br from-background/95 via-background/90 to-background/80 backdrop-blur-xl",
                                "border border-border/50 hover:border-primary/30",
                                "shadow-sm hover:shadow-xl hover:shadow-primary/5",
                                "hover:-translate-y-1",
                                shipment.flagged && "border-destructive/50 bg-gradient-to-br from-destructive/5 via-background/90 to-background/80"
                            )}
                            onClick={() => onSelectShipment(shipment)}
                        >
                            {/* Gradient accent bar at top */}
                            <div className={cn(
                                "absolute top-0 left-0 right-0 h-1 opacity-80",
                                shipment.status === "DELIVERED" && "bg-gradient-to-r from-green-500 to-emerald-500",
                                shipment.status === "IN_TRANSIT" && "bg-gradient-to-r from-purple-500 to-indigo-500",
                                shipment.status === "PENDING" && "bg-gradient-to-r from-yellow-500 to-amber-500",
                                shipment.status === "PICKED_UP" && "bg-gradient-to-r from-blue-500 to-cyan-500",
                                shipment.status === "OUT_FOR_DELIVERY" && "bg-gradient-to-r from-orange-500 to-red-400",
                                shipment.status === "CANCELLED" && "bg-gradient-to-r from-red-500 to-rose-500",
                                shipment.status === "ON_HOLD" && "bg-gradient-to-r from-gray-400 to-gray-500"
                            )} />

                            <CardContent className="p-4 sm:p-5 space-y-4">
                                {/* Header: Status + Actions */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-offset-background",
                                            statusDotColors[shipment.status],
                                            (shipment.status === "IN_TRANSIT" || shipment.status === "OUT_FOR_DELIVERY") && "animate-pulse"
                                        )} />
                                        <Badge variant="outline" className={cn("font-medium text-xs px-2.5 py-0.5", statusColors[shipment.status])}>
                                            {shipment.status.replace(/_/g, " ")}
                                        </Badge>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 -m-1 text-muted-foreground hover:text-foreground"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectShipment(shipment); }}>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>

                                            {isAdmin && (
                                                <>
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(shipment); }}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFlag?.(shipment); }}>
                                                        <Flag className={cn("mr-2 h-4 w-4", shipment.flagged && "fill-destructive text-destructive")} />
                                                        {shipment.flagged ? "Unflag" : "Flag"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.(shipment); }} className="text-destructive focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Tracking Info */}
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                                        {shipment.trackingNumber}
                                    </h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <Truck className="h-3.5 w-3.5" />
                                        {shipment.carrierName}
                                    </p>
                                </div>

                                {/* Route Visualization */}
                                <div className="relative py-2">
                                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-primary/40 via-muted to-primary/40 -translate-y-1/2" />
                                    <div className="relative flex justify-between items-center">
                                        <div className="bg-background px-2 flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <MapPin className="h-3 w-3 text-primary" />
                                            </div>
                                            <span className="text-xs font-semibold truncate max-w-[70px]">{shipment.pickupLocation.city}</span>
                                        </div>
                                        <div className="bg-background px-1">
                                            <Package className="h-4 w-4 text-muted-foreground/50" />
                                        </div>
                                        <div className="bg-background px-2 flex items-center gap-1.5">
                                            <span className="text-xs font-semibold truncate max-w-[70px] text-right">{shipment.deliveryLocation.city}</span>
                                            <div className="w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                                <MapPin className="h-3 w-3 text-green-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer: Priority + Rate */}
                                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            "text-xs font-semibold px-2.5 py-1",
                                            priorityColors[shipment.priority],
                                            shipment.priority === "URGENT" && "animate-pulse"
                                        )}
                                    >
                                        {shipment.priority}
                                    </Badge>
                                    <div className="text-right">
                                        <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                            {formatCurrency(shipment.rate)}
                                        </span>
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
