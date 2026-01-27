"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, TrendingUp, Truck, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { HorizontalNav } from "@/components/layout/horizontal-nav";
import { GridView } from "@/components/shipments/grid-view";
import { TileView } from "@/components/shipments/tile-view";
import { DetailModal } from "@/components/shipments/detail-modal";
import { dummyShipments } from "@/lib/dummy-data";
import { Shipment } from "@/types";

const ITEMS_PER_PAGE = 12;

// Dashboard stats
const stats = [
  {
    title: "Total Shipments",
    value: "1,284",
    change: "+12.5%",
    trend: "up",
    icon: Package,
    color: "from-blue-500 to-blue-600"
  },
  {
    title: "In Transit",
    value: "342",
    change: "+8.2%",
    trend: "up",
    icon: Truck,
    color: "from-purple-500 to-purple-600"
  },
  {
    title: "Delivered Today",
    value: "89",
    change: "+24.1%",
    trend: "up",
    icon: CheckCircle,
    color: "from-green-500 to-green-600"
  },
  {
    title: "Pending",
    value: "127",
    change: "-3.4%",
    trend: "down",
    icon: Clock,
    color: "from-yellow-500 to-yellow-600"
  },
  {
    title: "Flagged",
    value: "8",
    change: "+2",
    trend: "up",
    icon: AlertTriangle,
    color: "from-red-500 to-red-600"
  },
  {
    title: "Revenue",
    value: "$48.2K",
    change: "+18.7%",
    trend: "up",
    icon: TrendingUp,
    color: "from-emerald-500 to-emerald-600"
  }
];

export default function DashboardPage() {
  const [currentView, setCurrentView] = React.useState<"grid" | "tile">("tile");
  const [selectedShipment, setSelectedShipment] = React.useState<Shipment | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState<string>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter and sort shipments
  const filteredShipments = React.useMemo(() => {
    let result = [...dummyShipments];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.trackingNumber.toLowerCase().includes(query) ||
          s.shipperName.toLowerCase().includes(query) ||
          s.carrierName.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortBy as keyof Shipment];
      let bVal: any = b[sortBy as keyof Shipment];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [searchQuery, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredShipments.length / ITEMS_PER_PAGE);
  const paginatedShipments = filteredShipments.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <HorizontalNav
          currentView={currentView}
          onViewChange={setCurrentView}
          showViewToggle
          onSearch={setSearchQuery}
        />

        <main className="flex-1 p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {stats.map((stat, index) => (
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
            ))}
          </motion.div>

          {/* Shipments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Shipments</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredShipments.length} shipments found
                </p>
              </div>
            </div>

            {/* View Content */}
            <AnimatePresence mode="wait">
              {currentView === "tile" ? (
                <motion.div
                  key="tile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TileView
                    shipments={paginatedShipments}
                    onSelectShipment={handleSelectShipment}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <GridView
                    shipments={paginatedShipments}
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
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
