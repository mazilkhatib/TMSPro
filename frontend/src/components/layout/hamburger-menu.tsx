"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    X,
    LayoutDashboard,
    Package,
    Truck,
    MapPin,
    BarChart3,
    Settings,
    Users,
    FileText,
    ChevronDown,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface MenuItem {
    title: string;
    href?: string;
    icon: React.ReactNode;
    children?: { title: string; href: string }[];
}

const menuItems: MenuItem[] = [
    {
        title: "Dashboard",
        href: "/",
        icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
        title: "Shipments",
        icon: <Package className="h-5 w-5" />,
        children: [
            { title: "All Shipments", href: "/shipments" },
            { title: "Create New", href: "/shipments/new" },
            { title: "In Transit", href: "/shipments?status=IN_TRANSIT" },
            { title: "Delivered", href: "/shipments?status=DELIVERED" }
        ]
    },
    {
        title: "Carriers",
        icon: <Truck className="h-5 w-5" />,
        children: [
            { title: "All Carriers", href: "/carriers" },
            { title: "Add Carrier", href: "/carriers/new" }
        ]
    },
    {
        title: "Locations",
        href: "/locations",
        icon: <MapPin className="h-5 w-5" />
    },
    {
        title: "Reports",
        icon: <BarChart3 className="h-5 w-5" />,
        children: [
            { title: "Overview", href: "/reports" },
            { title: "Performance", href: "/reports/performance" },
            { title: "Costs", href: "/reports/costs" }
        ]
    },
    {
        title: "Users",
        href: "/users",
        icon: <Users className="h-5 w-5" />
    },
    {
        title: "Documents",
        href: "/documents",
        icon: <FileText className="h-5 w-5" />
    },
    {
        title: "Settings",
        href: "/settings",
        icon: <Settings className="h-5 w-5" />
    }
];

interface HamburgerMenuProps {
    className?: string;
}

export function HamburgerMenu({ className }: HamburgerMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
    const pathname = usePathname();

    const toggleExpanded = (title: string) => {
        setExpandedItems((prev) =>
            prev.includes(title)
                ? prev.filter((item) => item !== title)
                : [...prev, title]
        );
    };

    const isActive = (href: string) => pathname === href;

    return (
        <>
            {/* Hamburger Button */}
            <Button
                variant="ghost"
                size="icon"
                className={cn("relative z-50", className)}
                onClick={() => setIsOpen(!isOpen)}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <X className="h-5 w-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Menu className="h-5 w-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Button>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Slide-out Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed left-0 top-0 z-40 h-full w-72 border-r bg-background/95 backdrop-blur-md"
                    >
                        {/* Logo Area */}
                        <div className="flex h-16 items-center gap-2 border-b px-6">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                                <Package className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                                TMS Pro
                            </span>
                        </div>

                        {/* Menu Items */}
                        <ScrollArea className="h-[calc(100vh-4rem)]">
                            <div className="p-4 space-y-1">
                                {menuItems.map((item) => (
                                    <div key={item.title}>
                                        {item.href ? (
                                            <Link
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                                    "hover:bg-accent hover:text-accent-foreground",
                                                    isActive(item.href) &&
                                                    "bg-primary/10 text-primary border-l-2 border-primary"
                                                )}
                                            >
                                                {item.icon}
                                                {item.title}
                                            </Link>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => toggleExpanded(item.title)}
                                                    className={cn(
                                                        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                                        "hover:bg-accent hover:text-accent-foreground",
                                                        expandedItems.includes(item.title) && "bg-accent/50"
                                                    )}
                                                >
                                                    <span className="flex items-center gap-3">
                                                        {item.icon}
                                                        {item.title}
                                                    </span>
                                                    <motion.div
                                                        animate={{
                                                            rotate: expandedItems.includes(item.title) ? 180 : 0
                                                        }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <ChevronDown className="h-4 w-4" />
                                                    </motion.div>
                                                </button>
                                                <AnimatePresence>
                                                    {expandedItems.includes(item.title) && item.children && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="ml-6 mt-1 space-y-1 border-l pl-4">
                                                                {item.children.map((child) => (
                                                                    <Link
                                                                        key={child.href}
                                                                        href={child.href}
                                                                        onClick={() => setIsOpen(false)}
                                                                        className={cn(
                                                                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                                                            "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                                                            isActive(child.href) &&
                                                                            "bg-primary/10 text-primary font-medium"
                                                                        )}
                                                                    >
                                                                        <ChevronRight className="h-3 w-3" />
                                                                        {child.title}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
