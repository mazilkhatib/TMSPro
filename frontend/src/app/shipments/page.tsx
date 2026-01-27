"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { motion } from "framer-motion";
import {
    Search,
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
import { Input } from "@/components/ui/input";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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
    const [selectedShipment, setSelectedShipment] = React.useState<Shipment | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    // Search and Filter State
    const [searchTerm, setSearchTerm] = React.useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string>("all");
    const [priorityFilter, setPriorityFilter] = React.useState<string>("all");

    // Debounce search term
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            if (page !== 1) setPage(1); // Reset page on new search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset page when filters change
    React.useEffect(() => {
        setPage(1);
    }, [statusFilter, priorityFilter]);

    // Prepare query variables
    const shipmentsQueryVars = React.useMemo(() => {
        const filter: any = {};

        if (debouncedSearchTerm) filter.search = debouncedSearchTerm;
        if (statusFilter && statusFilter !== "all") filter.status = statusFilter;
        if (priorityFilter && priorityFilter !== "all") filter.priority = priorityFilter;

        return {
            filter: Object.keys(filter).length > 0 ? filter : undefined,
            page,
            limit: ITEMS_PER_PAGE,
            sortBy: "createdAt",
            sortOrder: "DESC" as "ASC" | "DESC"
        };
    }, [debouncedSearchTerm, statusFilter, priorityFilter, page]);

    // Fetch shipments
    const {
        data: shipmentsData,
        loading: shipmentsLoading,
        error: shipmentsError,
        refetch: refetchShipments
    } = useQuery<ShipmentsResponse>(GET_SHIPMENTS, {
        variables: shipmentsQueryVars,
        fetchPolicy: "cache-and-network",
        notifyOnNetworkStatusChange: true
    });

    // Delete shipment mutation
    const [deleteShipment, { loading: deleteLoading }] = useMutation<DeleteShipmentResponse>(DELETE_SHIPMENT, {
        onCompleted: () => {
            toast.success("Shipment deleted successfully");
            setIsDeleteDialogOpen(false);
            setSelectedShipment(null);
            refetchShipments();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete shipment");
        }
    });

    // Flag shipment mutation
    const [flagShipment] = useMutation<FlagShipmentResponse>(FLAG_SHIPMENT, {
        onCompleted: (data) => {
            const isFlagged = data.flagShipment.flagged;
            toast.success(isFlagged ? "Shipment flagged" : "Shipment unflagged");
            refetchShipments();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update shipment status");
        }
    });

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
                        onCreate={() => router.push("/shipments/new")}
                    />

                    <main className="flex-1 p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
                        <Tabs defaultValue="table" className="w-full space-y-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold">Shipments</h1>
                                    <p className="text-muted-foreground mt-1">
                                        {totalCount} shipments found
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <TabsList className="grid w-[200px] grid-cols-2">
                                        <TabsTrigger value="table">Table</TabsTrigger>
                                        <TabsTrigger value="grid">Grid</TabsTrigger>
                                    </TabsList>
                                    <Button onClick={() => router.push("/shipments/new")} size="sm" className="h-9">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create
                                    </Button>
                                </div>
                            </div>

                            <TabsContent value="table" className="mt-0">
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
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {shipments.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
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
                            </TabsContent>

                            <TabsContent value="grid" className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {shipments.map((shipment: Shipment, index: number) => (
                                        <motion.div
                                            key={shipment.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.02 }}
                                        >
                                            <Card className={cn("h-full hover:shadow-lg transition-shadow duration-200", shipment.flagged && "border-destructive/50 bg-destructive/5")}>
                                                <CardContent className="p-6 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <Badge variant="outline" className={cn("font-mono", statusColors[shipment.status])}>
                                                            {shipment.status.replace(/_/g, " ")}
                                                        </Badge>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => router.push(`/shipments/edit/${shipment.id}`)}>
                                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => router.push(`/shipments/edit/${shipment.id}`)}>
                                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleFlag(shipment)}>
                                                                    <Flag className="mr-2 h-4 w-4" /> {shipment.flagged ? "Unflag" : "Flag"}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => { setSelectedShipment(shipment); setIsDeleteDialogOpen(true); }} className="text-destructive">
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
                                </div>
                            </TabsContent>
                        </Tabs>

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
        </ProtectedRoute >
    );
}
