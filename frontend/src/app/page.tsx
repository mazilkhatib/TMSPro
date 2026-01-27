"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, TrendingUp, Truck, Clock, AlertTriangle, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { HorizontalNav } from "@/components/layout/horizontal-nav";
import { GridView } from "@/components/shipments/grid-view";
import { TileView } from "@/components/shipments/tile-view";
import { DetailModal } from "@/components/shipments/detail-modal";

import { DeleteConfirmation } from "@/components/shipments/delete-confirmation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { GET_SHIPMENTS, GET_SHIPMENT_STATS } from "@/graphql/queries";
import { FLAG_SHIPMENT } from "@/graphql/mutations";
import { Shipment, ShipmentStats } from "@/types";
import { toast } from "sonner";

// GraphQL response types
interface ShipmentStatsResponse {
  shipmentStats: ShipmentStats;
}

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
  const [currentView, setCurrentView] = React.useState<"grid" | "tile">("tile");
  const [selectedShipment, setSelectedShipment] = React.useState<Shipment | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState<string>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = React.useState("");

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

  // Prepare query variables (reactive to state changes)
  const shipmentsQueryVars = React.useMemo(() => ({
    filter: searchQuery ? { search: searchQuery } : undefined,
    page,
    limit: ITEMS_PER_PAGE,
    sortBy,
    sortOrder: sortOrder.toUpperCase() as "ASC" | "DESC",
  }), [searchQuery, page, sortBy, sortOrder]);

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
        change: "+12.5%",
        trend: "up" as const,
        icon: Package,
        color: "from-blue-500 to-blue-600"
      },
      {
        title: "In Transit",
        value: statsInfo.inTransit.toLocaleString(),
        change: "+8.2%",
        trend: "up" as const,
        icon: Truck,
        color: "from-purple-500 to-purple-600"
      },
      {
        title: "Delivered",
        value: statsInfo.delivered.toLocaleString(),
        change: "+24.1%",
        trend: "up" as const,
        icon: CheckCircle,
        color: "from-green-500 to-green-600"
      },
      {
        title: "Pending",
        value: statsInfo.pending.toLocaleString(),
        change: "-3.4%",
        trend: "down" as const,
        icon: Clock,
        color: "from-yellow-500 to-yellow-600"
      },
      {
        title: "Flagged",
        value: statsInfo.flagged.toLocaleString(),
        change: "+2",
        trend: "up" as const,
        icon: AlertTriangle,
        color: "from-red-500 to-red-600"
      },
      {
        title: "Revenue",
        value: `$${(statsInfo.totalRevenue / 1000).toFixed(1)}K`,
        change: "+18.7%",
        trend: "up" as const,
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

  // Debounced search handler
  const debouncedSearch = React.useMemo(
    () =>
      setTimeout(() => {
        // Reset to page 1 when search changes
        if (page !== 1) setPage(1);
      }, 500),
    [searchQuery]
  );

  React.useEffect(() => {
    return () => clearTimeout(debouncedSearch);
  }, [debouncedSearch]);

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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
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
            currentView={currentView}
            onViewChange={setCurrentView}
            showViewToggle
            onSearch={handleSearch}
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
                            <p
                              className={`text-xs font-medium ${stat.trend === "up" ? "text-green-500" : "text-red-500"
                                }`}
                            >
                              {stat.change}
                            </p>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Shipments</h2>
                  <p className="text-sm text-muted-foreground">
                    {totalCount} shipments found
                  </p>
                </div>
              </div>

              {/* View Content */}
              <AnimatePresence mode="wait">
                {shipmentsLoading && !shipmentsData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : currentView === "tile" ? (
                  <motion.div
                    key={`tile-${page}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TileView
                      shipments={shipments}
                      onSelectShipment={handleSelectShipment}
                      page={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`grid-${page}`}
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
                )}
              </AnimatePresence>
            </div>
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
