"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { motion } from "framer-motion";
import {
    Plus,
    Edit,
    Trash2,
    Flag,
    Loader2,
    AlertCircle,
    CheckCircle,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { HorizontalNav } from "@/components/layout/horizontal-nav";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { GET_SHIPMENTS } from "@/graphql/queries";
import { DELETE_SHIPMENT, FLAG_SHIPMENT } from "@/graphql/mutations";
import { Shipment, ShipmentStatus, ShipmentPriority } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ShipmentsResponse {
    shipments: {
        shipments: Shipment[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

interface DeleteShipmentResponse {
    deleteShipment: boolean;
}

interface FlagShipmentResponse {
    flagShipment: {
        id: string;
        flagged: boolean;
    };
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

const ITEMS_PER_PAGE = 20;

export default function ShipmentsPage() {
    const router = useRouter();
    const [page, setPage] = React.useState(1);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedShipment, setSelectedShipment] = React.useState<Shipment | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    // Fetch shipments
    const {
        data: shipmentsData,
        loading: shipmentsLoading,
        error: shipmentsError,
        refetch: refetchShipments
    } = useQuery<ShipmentsResponse>(GET_SHIPMENTS, {
        variables: {
            filter: searchQuery ? { search: searchQuery } : undefined,
            page,
            limit: ITEMS_PER_PAGE,
            sortBy: "createdAt",
            sortOrder: "DESC"
        },
        fetchPolicy: "cache-and-network",
        notifyOnNetworkStatusChange: true
    });

    // Delete mutation
    const [deleteShipment, { loading: deleteLoading }] = useMutation<DeleteShipmentResponse>(DELETE_SHIPMENT, {
        onCompleted: (data) => {
            if (data.deleteShipment) {
                toast.success("Shipment deleted successfully");
                refetchShipments();
                setIsDeleteDialogOpen(false);
                setSelectedShipment(null);
            }
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    // Flag mutation
    const [flagShipment] = useMutation<FlagShipmentResponse>(FLAG_SHIPMENT, {
        onCompleted: (data) => {
            toast.success(data.flagShipment.flagged ? "Shipment flagged" : "Shipment unflagged");
            refetchShipments();
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    // Prepare query variables (reactive to state changes)
    const shipmentsQueryVars = React.useMemo(() => ({
        filter: searchQuery ? { search: searchQuery } : undefined,
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: "createdAt",
        sortOrder: "DESC" as "ASC" | "DESC"
    }), [searchQuery, page]);

    // Get shipments and pagination info from response
    const shipments = shipmentsData?.shipments?.shipments || [];
    const totalCount = shipmentsData?.shipments?.pagination?.total || 0;
    const totalPages = shipmentsData?.shipments?.pagination?.totalPages || 0;

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

    const handleDelete = () => {
        if (selectedShipment) {
            deleteShipment({ variables: { id: selectedShipment.id } });
        }
    };

    const handleFlag = (shipment: Shipment) => {
        flagShipment({
            variables: {
                id: shipment.id,
                flagged: !shipment.flagged
            }
        });
    };

    const handleEdit = (shipment: Shipment) => {
        router.push(`/shipments/edit/${shipment.id}`);
    };

    const handleView = (shipment: Shipment) => {
        // For now, just edit. You can create a separate view page later
        router.push(`/shipments/edit/${shipment.id}`);
    };

    // Show loading state on initial load
    if (shipmentsLoading && !shipmentsData) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                        <p className="text-muted-foreground">Loading shipments...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    // Show error state
    if (shipmentsError && !shipmentsData) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <Card className="max-w-md w-full">
                        <CardContent className="p-6 text-center space-y-4">
                            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                            <div>
                                <h2 className="text-lg font-semibold">Error Loading Data</h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {shipmentsError.message || "Failed to load shipments. Please try again."}
                                </p>
                            </div>
                            <Button
                                onClick={() => refetchShipments()}
                                variant="outline"
                            >
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <HorizontalNav
                        currentView="grid"
                        onViewChange={() => { }}
                        showViewToggle={false}
                        onSearch={setSearchQuery}
                        onCreate={() => router.push("/shipments/new")}
                    />

                    <main className="flex-1 p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Shipments</h1>
                                <p className="text-muted-foreground mt-1">
                                    {totalCount} shipments found
                                </p>
                            </div>
                            <Button onClick={() => router.push("/shipments/new")} size="lg">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Shipment
                            </Button>
                        </div>

                        {/* Table */}
                        <Card className="border-border/50">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-b border-border/50">
                                            <TableHead>Tracking #</TableHead>
                                            <TableHead>Shipper</TableHead>
                                            <TableHead>Carrier</TableHead>
                                            <TableHead>Origin</TableHead>
                                            <TableHead>Destination</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead className="text-right">Rate</TableHead>
                                            <TableHead className="text-right">Weight</TableHead>
                                            <TableHead>Est. Delivery</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {shipments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                                                    No shipments found. Create your first shipment to get started.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            shipments.map((shipment: Shipment, index: number) => (
                                                <motion.tr
                                                    key={shipment.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2, delay: index * 0.02 }}
                                                    className={cn(
                                                        "border-b border-border/30 transition-colors",
                                                        shipment.flagged && "bg-destructive/5"
                                                    )}
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
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {formatDate(shipment.estimatedDelivery)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/shipments/edit/${shipment.id}`} className="flex items-center w-full cursor-pointer">
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Details
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/shipments/edit/${shipment.id}`} className="flex items-center w-full cursor-pointer">
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleFlag(shipment)}>
                                                                    <Flag className={cn("mr-2 h-4 w-4", shipment.flagged && "fill-destructive text-destructive")} />
                                                                    {shipment.flagged ? "Unflag" : "Flag"}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedShipment(shipment);
                                                                        setIsDeleteDialogOpen(true);
                                                                    }}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-2">
                                <p className="text-sm text-muted-foreground">
                                    Page {page} of {totalPages}
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setPage(1)}
                                        disabled={page === 1}
                                    >
                                        ««
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        ‹
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                    >
                                        ›
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setPage(totalPages)}
                                        disabled={page === totalPages}
                                    >
                                        »»
                                    </Button>
                                </div>
                            </div>
                        )}
                    </main>

                    {/* Delete Confirmation Dialog */}
                    {isDeleteDialogOpen && selectedShipment && (
                        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <Card className="max-w-md w-full">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-destructive/15 flex items-center justify-center">
                                            <Trash2 className="h-5 w-5 text-destructive" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">Delete Shipment</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Are you sure you want to delete shipment {selectedShipment.trackingNumber}?
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsDeleteDialogOpen(false);
                                                setSelectedShipment(null);
                                            }}
                                            disabled={deleteLoading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDelete}
                                            disabled={deleteLoading}
                                        >
                                            {deleteLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                "Delete"
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}
