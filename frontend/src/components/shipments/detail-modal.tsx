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
    Share2,
    ShieldAlert
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Shipment, ShipmentStatus, ShipmentPriority } from "@/types";
import { useAuth } from "@/hooks/useAuth";

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
    PENDING: <Clock className="h-3.5 w-3.5" />,
    PICKED_UP: <Package className="h-3.5 w-3.5" />,
    IN_TRANSIT: <Truck className="h-3.5 w-3.5" />,
    OUT_FOR_DELIVERY: <Truck className="h-3.5 w-3.5" />,
    DELIVERED: <CheckCircle2 className="h-3.5 w-3.5" />,
    CANCELLED: <X className="h-3.5 w-3.5" />,
    ON_HOLD: <AlertCircle className="h-3.5 w-3.5" />
};

const priorityColors: Record<ShipmentPriority, string> = {
    LOW: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
    MEDIUM: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    HIGH: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
    URGENT: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
};

export function DetailModal({
    shipment,
    isOpen,
    onClose,
    onEdit,
    onFlag,
    onDelete
}: DetailModalProps) {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    if (!shipment) return null;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "short",
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

    const formatWeight = (weight: number) => {
        return `${weight.toLocaleString()} lbs`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background/80 backdrop-blur-xl border-border/50 shadow-2xl">
                {/* Header with Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-6 pb-4 bg-gradient-to-b from-muted/50 to-transparent border-b border-border/40"
                >
                    <DialogHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <DialogTitle className="text-2xl font-bold tracking-tight">
                                        {shipment.shipperName}
                                    </DialogTitle>
                                    {shipment.flagged && (
                                        <Badge variant="destructive" className="h-5 px-1.5 gap-0.5 text-[10px] uppercase tracking-wider">
                                            <Flag className="h-3 w-3 fill-current" />
                                            Flagged
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm group cursor-pointer hover:text-foreground transition-colors">
                                    <span>{shipment.trackingNumber}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-sans text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        Copy
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "h-7 px-3 text-xs font-medium flex items-center gap-1.5 rounded-lg border shadow-sm backdrop-blur-sm",
                                        statusColors[shipment.status]
                                    )}
                                >
                                    {statusIcons[shipment.status]}
                                    {shipment.status.replace(/_/g, " ")}
                                </Badge>
                                <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider font-semibold border backdrop-blur-sm", priorityColors[shipment.priority])}>
                                    {shipment.priority} Priority
                                </Badge>
                            </div>
                        </div>
                    </DialogHeader>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 space-y-8"
                >
                    {/* Route Visualization */}
                    <div className="relative">
                        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-green-500/20 via-muted to-red-500/20 -translate-y-1/2 rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-2 -rotate-90">
                            <PlanePathIcon className="h-6 w-6 text-muted-foreground/30 transform rotate-90" />
                        </div>

                        <div className="grid grid-cols-2 gap-8 relative z-10">
                            {/* Origin */}
                            <div className="space-y-3 pr-4">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-500 mb-1">
                                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-sm backdrop-blur-sm">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Origin</span>
                                </div>
                                <div className="space-y-0.5 pl-2 border-l-2 border-green-500/20">
                                    <p className="font-semibold text-base leading-tight">{shipment.pickupLocation.city}</p>
                                    <p className="text-sm text-muted-foreground">{shipment.pickupLocation.state}, {shipment.pickupLocation.country}</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">{shipment.pickupLocation.address}</p>
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="space-y-3 pl-4 text-right">
                                <div className="flex items-center gap-2 justify-end text-red-600 dark:text-red-500 mb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Destination</span>
                                    <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-sm backdrop-blur-sm">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="space-y-0.5 pr-2 border-r-2 border-red-500/20">
                                    <p className="font-semibold text-base leading-tight">{shipment.deliveryLocation.city}</p>
                                    <p className="text-sm text-muted-foreground">{shipment.deliveryLocation.state}, {shipment.deliveryLocation.country}</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">{shipment.deliveryLocation.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            icon={Truck}
                            label="Carrier"
                            value={shipment.carrierName}
                            delay={0.1}
                        />
                        <MetricCard
                            icon={Weight}
                            label="Weight"
                            value={formatWeight(shipment.weight)}
                            delay={0.15}
                        />
                        <MetricCard
                            icon={DollarSign}
                            label="Value"
                            value={formatCurrency(shipment.rate)}
                            valueColor="text-green-600 dark:text-green-400"
                            delay={0.2}
                        />
                        <MetricCard
                            icon={Calendar}
                            label="Est. Arrival"
                            value={formatDate(shipment.estimatedDelivery)}
                            delay={0.25}
                        />
                    </div>

                    {/* Notes Section - if present */}
                    {shipment.notes && (
                        <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Additional Notes</span>
                            </div>
                            <p className="text-sm text-foreground/90 leading-relaxed">
                                {shipment.notes}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col text-xs text-muted-foreground gap-1">
                            <span>Created {formatDate(shipment.createdAt)}</span>
                            {shipment.actualDelivery && (
                                <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Delivered {formatDate(shipment.actualDelivery)}
                                </span>
                            )}
                        </div>

                        <TooltipProvider>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="cursor-help">
                                            {!isAdmin && (
                                                <Button variant="ghost" size="icon" className="text-muted-foreground/50" disabled>
                                                    <ShieldAlert className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    {!isAdmin && (
                                        <TooltipContent>
                                            <p>Admin access required for actions</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>

                                {/* Action Buttons */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit?.(shipment)}
                                    disabled={!isAdmin}
                                    className={cn(
                                        "transition-all",
                                        !isAdmin && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <Edit className="h-3.5 w-3.5 mr-2" />
                                    Edit
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onFlag?.(shipment)}
                                    disabled={!isAdmin}
                                    className={cn(
                                        "transition-all",
                                        shipment.flagged ? "text-destructive border-destructive/30 bg-destructive/5 hover:bg-destructive/10" : "",
                                        !isAdmin && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <Flag className={cn("h-3.5 w-3.5 mr-2", shipment.flagged && "fill-current")} />
                                    {shipment.flagged ? "Unflag" : "Flag"}
                                </Button>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onDelete?.(shipment)}
                                    disabled={!isAdmin}
                                    className={cn(
                                        "transition-all",
                                        !isAdmin && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </TooltipProvider>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

// Sub-components for cleaner code
function MetricCard({ icon: Icon, label, value, valueColor = "text-foreground", delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="flex flex-col gap-1.5 p-3 rounded-xl bg-background border border-border/50 shadow-sm hover:border-primary/20 hover:shadow-md transition-all"
        >
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <p className={cn("font-semibold text-sm truncate", valueColor)} title={value}>
                {value}
            </p>
        </motion.div>
    );
}

function PlanePathIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
    )
}
