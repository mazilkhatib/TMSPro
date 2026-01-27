"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    MapPin,
    Truck,
    Package,
    Calendar,
    DollarSign,
    Weight,
    Flag,
    Edit,
    Trash2,
    ChevronRight,
    Clock,
    FileText,
    CheckCircle2,
    AlertCircle,
    Share2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Shipment, ShipmentStatus, ShipmentPriority } from "@/types";

interface DetailModalProps {
    shipment: Shipment | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (shipment: Shipment) => void;
    onFlag?: (shipment: Shipment) => void;
    onDelete?: (shipment: Shipment) => void;
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

const statusIcons: Record<ShipmentStatus, React.ReactNode> = {
    PENDING: <Clock className="h-4 w-4" />,
    PICKED_UP: <Package className="h-4 w-4" />,
    IN_TRANSIT: <Truck className="h-4 w-4" />,
    OUT_FOR_DELIVERY: <Truck className="h-4 w-4" />,
    DELIVERED: <CheckCircle2 className="h-4 w-4" />,
    CANCELLED: <X className="h-4 w-4" />,
    ON_HOLD: <AlertCircle className="h-4 w-4" />
};

const priorityColors: Record<ShipmentPriority, string> = {
    LOW: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
    MEDIUM: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    HIGH: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    URGENT: "bg-red-500/15 text-red-600 dark:text-red-400"
};

export function DetailModal({
    shipment,
    isOpen,
    onClose,
    onEdit,
    onFlag,
    onDelete
}: DetailModalProps) {
    if (!shipment) return null;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "short",
            month: "long",
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

    const formatWeight = (weight: number) => {
        return `${weight.toLocaleString()} lbs`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden">
                {/* Header with gradient */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4"
                >
                    <DialogHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <DialogTitle className="text-2xl font-bold">
                                    {shipment.shipperName}
                                </DialogTitle>
                                <p className="font-mono text-sm text-muted-foreground">
                                    {shipment.trackingNumber}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-sm font-medium flex items-center gap-1.5",
                                        statusColors[shipment.status]
                                    )}
                                >
                                    {statusIcons[shipment.status]}
                                    {shipment.status.replace(/_/g, " ")}
                                </Badge>
                                <Badge variant="secondary" className={cn("text-xs", priorityColors[shipment.priority])}>
                                    {shipment.priority} Priority
                                </Badge>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Flagged indicator */}
                    {shipment.flagged && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 right-16 flex items-center gap-1 text-destructive text-sm"
                        >
                            <Flag className="h-4 w-4 fill-destructive" />
                            <span className="font-medium">Flagged</span>
                        </motion.div>
                    )}
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 pt-2 space-y-6"
                >
                    {/* Route Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Route Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Origin */}
                            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 space-y-2">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm font-medium">Origin</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">{shipment.pickupLocation.address}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {shipment.pickupLocation.city}, {shipment.pickupLocation.state} {shipment.pickupLocation.zip}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{shipment.pickupLocation.country}</p>
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm font-medium">Destination</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">{shipment.deliveryLocation.address}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {shipment.deliveryLocation.city}, {shipment.deliveryLocation.state} {shipment.deliveryLocation.zip}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{shipment.deliveryLocation.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Truck className="h-4 w-4" />
                                <span className="text-xs">Carrier</span>
                            </div>
                            <p className="font-medium">{shipment.carrierName}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-xs">Rate</span>
                            </div>
                            <p className="font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(shipment.rate)}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Weight className="h-4 w-4" />
                                <span className="text-xs">Weight</span>
                            </div>
                            <p className="font-medium">{formatWeight(shipment.weight)}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span className="text-xs">Est. Delivery</span>
                            </div>
                            <p className="font-medium">{formatDate(shipment.estimatedDelivery)}</p>
                        </div>
                    </div>

                    {/* Notes */}
                    {shipment.notes && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm font-medium">Notes</span>
                                </div>
                                <p className="text-sm p-3 rounded-lg bg-muted/50">{shipment.notes}</p>
                            </div>
                        </>
                    )}

                    {/* Timestamps */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created: {formatDate(shipment.createdAt)}</span>
                        <span>•</span>
                        <span>Updated: {formatDate(shipment.updatedAt)}</span>
                        {shipment.actualDelivery && (
                            <>
                                <span>•</span>
                                <span className="text-green-600 dark:text-green-400">
                                    Delivered: {formatDate(shipment.actualDelivery)}
                                </span>
                            </>
                        )}
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => onEdit?.(shipment)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onFlag?.(shipment)}
                                className={shipment.flagged ? "text-destructive border-destructive/50" : ""}
                            >
                                <Flag className={cn("h-4 w-4 mr-2", shipment.flagged && "fill-destructive")} />
                                {shipment.flagged ? "Unflag" : "Flag"}
                            </Button>
                            <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete?.(shipment)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
