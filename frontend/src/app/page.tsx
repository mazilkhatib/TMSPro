"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, TrendingUp, Truck, Clock, AlertTriangle, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { HorizontalNav } from "@/components/layout/horizontal-nav";
import { GridView } from "@/components/shipments/grid-view";
import { TileView } from "@/components/shipments/tile-view";
import { DetailModal } from "@/components/shipments/detail-modal";
import { ViewSwitcher } from "@/components/common/view-switcher";

import { DeleteConfirmation } from "@/components/shipments/delete-confirmation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { GET_SHIPMENTS, GET_SHIPMENT_STATS } from "@/graphql/queries";
import { FLAG_SHIPMENT } from "@/graphql/mutations";
import { Shipment, ShipmentStats, ShipmentStatus, ShipmentPriority } from "@/types";
import { toast } from "sonner";

// GraphQL response types
interface ShipmentStatsResponse {
  shipmentStats: ShipmentStats;
}

import {
  Tabs,
  TabsContent,
  TabsTrigger,
} from "@/components/ui/tabs";

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ShipmentsResponse {
  shipments: {
    shipments: Shipment[];
    pagination: PaginationInfo;
  };
}

const ITEMS_PER_PAGE = 12;

// ... types
interface FlagShipmentResponse {
  flagShipment: {
    id: string;
    flagged: boolean;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [selectedShipment, setSelectedShipment] = React.useState<Shipment | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState<string>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // View State
  const [currentView, setCurrentView] = React.useState("grid");

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

  // Flag mutation
  const [flagShipment] = useMutation<FlagShipmentResponse>(FLAG_SHIPMENT, {
    refetchQueries: [{ query: GET_SHIPMENTS }, { query: GET_SHIPMENT_STATS }],
    onCompleted: (data) => {
      toast.success(data.flagShipment.flagged ? "Shipment flagged" : "Shipment unflagged");
    },
    onError: (error) => toast.error(error.message)
  });

  // Fetch statistics
  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useQuery<ShipmentStatsResponse>(GET_SHIPMENT_STATS, {
    pollInterval: 30000, // Refresh every 30 seconds
    fetchPolicy: "cache-and-network",
  });

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
      sortBy,
      sortOrder: sortOrder.toUpperCase() as "ASC" | "DESC",
    };
  }, [debouncedSearchTerm, statusFilter, priorityFilter, page, sortBy, sortOrder]);

  // Fetch shipments
  const {
    data: shipmentsData,
    loading: shipmentsLoading,
    error: shipmentsError,
    refetch: refetchShipments,
  } = useQuery<ShipmentsResponse>(GET_SHIPMENTS, {
    variables: shipmentsQueryVars,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // Transform statistics data
  const stats = React.useMemo(() => {
    if (!statsData?.shipmentStats) return [];

    const statsInfo = statsData.shipmentStats;
    return [
      {
        title: "Total Shipments",
        value: statsInfo.total.toLocaleString(),
        icon: Package,
        color: "from-blue-500 to-blue-600"
      },
      {
        title: "In Transit",
        value: statsInfo.inTransit.toLocaleString(),
        icon: Truck,
        color: "from-purple-500 to-purple-600"
      },
      {
        title: "Delivered",
        value: statsInfo.delivered.toLocaleString(),
        icon: CheckCircle,
        color: "from-green-500 to-green-600"
      },
      {
        title: "Pending",
        value: statsInfo.pending.toLocaleString(),
        icon: Clock,
        color: "from-yellow-500 to-yellow-600"
      },
      {
        title: "Flagged",
        value: statsInfo.flagged.toLocaleString(),
        icon: AlertTriangle,
        color: "from-red-500 to-red-600"
      },
      {
        title: "Revenue",
        value: `$${(statsInfo.totalRevenue / 1000).toFixed(1)}K`,
        icon: TrendingUp,
        color: "from-emerald-500 to-emerald-600"
      }
    ];
  }, [statsData]);

  // Get shipments and pagination info from response
  const shipments = shipmentsData?.shipments?.shipments || [];
  const totalCount = shipmentsData?.shipments?.pagination?.total || 0;
  const totalPages = shipmentsData?.shipments?.pagination?.totalPages || 0;
  const hasNextPage = shipmentsData?.shipments?.pagination?.hasNextPage || false;
  const hasPrevPage = shipmentsData?.shipments?.pagination?.hasPrevPage || false;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSelectShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedShipment(null), 200);
  };

  const handleEdit = (shipment: Shipment) => {
    router.push(`/shipments/edit/${shipment.id}`);
  };

  const handleFlag = (shipment: Shipment) => {
    flagShipment({
      variables: {
        id: shipment.id,
        flagged: !shipment.flagged
      }
    });
  };

  const handleDeleteClick = (shipment: Shipment) => {
    setSelectedShipment(shipment); // Ensure selectedShipment is set correctly (though it should be already if modal is open)
    setIsDeleteModalOpen(true);
  };

  // Show loading state on initial load
  if (shipmentsLoading && !shipmentsData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
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
              <button
                onClick={() => refetchShipments()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
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
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {statsLoading ? (
                // Loading skeleton for stats
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="animate-pulse space-y-2">
                        <div className="h-3 bg-muted rounded w-20" />
                        <div className="h-6 bg-muted rounded w-16" />
                        <div className="h-3 bg-muted rounded w-12" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">{stat.title}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                          </div>
                          <div
                            className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                          >
                            <stat.icon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </CardContent>
                      <div
                        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}
                      />
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* Shipments Section */}
            <Tabs value={currentView} onValueChange={setCurrentView} className="space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Shipments</h2>
                    <p className="text-sm text-muted-foreground">
                      {totalCount} shipments found
                    </p>
                  </div>
                  <ViewSwitcher />
                </div>

                {/* Modern Glassmorphism Filter Bar */}
                <div className="relative pt-4">
                  {/* Active filters count badge - positioned outside overflow container */}
                  <AnimatePresence>
                    {(statusFilter !== "all" || priorityFilter !== "all" || searchTerm) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute -top-0 right-4 z-20 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
                        {[statusFilter !== "all", priorityFilter !== "all", searchTerm].filter(Boolean).length} filter{[statusFilter !== "all", priorityFilter !== "all", searchTerm].filter(Boolean).length > 1 ? 's' : ''}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl"
                  >
                    {/* Gradient border effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-2xl" />

                    <div className="relative m-[1px] bg-background/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg">

                      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                        {/* Search Input with enhanced styling */}
                        <div className="relative flex-1 group">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                          </div>
                          <Input
                            placeholder="Search shipments by tracking number, carrier, shipper..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 text-base bg-muted/30 border-0 rounded-xl focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all duration-200 placeholder:text-muted-foreground/60"
                          />
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm("")}
                              className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {/* Filter Controls */}
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Status Filter */}
                          <div className="relative">
                            <Select
                              value={statusFilter}
                              onValueChange={setStatusFilter}
                            >
                              <SelectTrigger className={`w-[180px] h-12 rounded-xl border-0 bg-muted/30 hover:bg-muted/50 transition-all duration-200 cursor-pointer ${statusFilter !== "all" ? "ring-2 ring-primary/30 bg-primary/5" : ""}`}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${statusFilter !== "all" ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
                                  <SelectValue placeholder="All Statuses" />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-0 shadow-xl bg-background/95 backdrop-blur-xl">
                                <SelectItem value="all" className="rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                    All Statuses
                                  </span>
                                </SelectItem>
                                <SelectItem value="PENDING" className="rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    Pending
                                  </span>
                                </SelectItem>
                                <SelectItem value="PICKED_UP" className="rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    Picked Up
                                  </span>
                                </SelectItem>
                                <SelectItem value="IN_TRANSIT" className="rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                    In Transit
                                  </span>
                                </SelectItem>
                                <SelectItem value="OUT_FOR_DELIVERY" className="rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    Out for Delivery
                                  </span>
                                </SelectItem>
                                <SelectItem value="DELIVERED" className="rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    Delivered
                                  </span>
                                </SelectItem>
                                <SelectItem value="CANCELLED" className="rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    Cancelled
                                  </span>
                                </SelectItem>
                                <SelectItem value="ON_HOLD" className="rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                                    On Hold
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Priority Filter */}
                          <div className="relative">
                            <Select
                              value={priorityFilter}
                              onValueChange={setPriorityFilter}
                            >
                              <SelectTrigger className={`w-[160px] h-12 rounded-xl border-0 bg-muted/30 hover:bg-muted/50 transition-all duration-200 cursor-pointer ${priorityFilter !== "all" ? "ring-2 ring-primary/30 bg-primary/5" : ""}`}>
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className={`w-4 h-4 ${priorityFilter !== "all" ? "text-primary" : "text-muted-foreground/50"}`} />
                                  <SelectValue placeholder="Priority" />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-0 shadow-xl bg-background/95 backdrop-blur-xl">
                                <SelectItem value="all" className="rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                    All Priorities
                                  </span>
                                </SelectItem>
                                <SelectItem value="LOW" className="rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    Low
                                  </span>
                                </SelectItem>
                                <SelectItem value="MEDIUM" className="rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                    Medium
                                  </span>
                                </SelectItem>
                                <SelectItem value="HIGH" className="rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    High
                                  </span>
                                </SelectItem>
                                <SelectItem value="URGENT" className="rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    Urgent
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Clear Filters Button */}
                          <AnimatePresence>
                            {(statusFilter !== "all" || priorityFilter !== "all" || searchTerm) && (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                                onClick={() => {
                                  setStatusFilter("all");
                                  setPriorityFilter("all");
                                  setSearchTerm("");
                                }}
                                className="h-12 px-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 font-medium transition-all duration-200 flex items-center gap-2"
                              >
                                <Package className="w-4 h-4" />
                                Clear
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* View Content */}
                <AnimatePresence mode="wait">
                  {shipmentsLoading && !shipmentsData ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <TabsContent value="grid" className="mt-0">
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TileView
                            shipments={shipments}
                            onSelectShipment={handleSelectShipment}
                            onEdit={handleEdit}
                            onFlag={handleFlag}
                            onDelete={handleDeleteClick}
                            page={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                          />
                        </motion.div>
                      </TabsContent>
                      <TabsContent value="list" className="mt-0">
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <GridView
                            shipments={shipments}
                            onSelectShipment={handleSelectShipment}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                            page={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                          />
                        </motion.div>
                      </TabsContent>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </Tabs>
          </main>

          {/* Detail Modal */}
          <DetailModal
            shipment={selectedShipment}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onEdit={handleEdit}
            onFlag={handleFlag}
            onDelete={handleDeleteClick}
          />

          {/* Create Shipment Modal */}


          {/* Delete Confirmation Modal */}
          <DeleteConfirmation
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            shipmentId={selectedShipment?.id || ""}
            shipmentNumber={selectedShipment?.trackingNumber || ""}
            onSuccess={() => {
              setIsDeleteModalOpen(false);
              setIsModalOpen(false);
              refetchShipments();
            }}
          />
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
