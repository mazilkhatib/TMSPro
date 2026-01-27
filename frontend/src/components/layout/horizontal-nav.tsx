"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Grid3X3, LayoutGrid, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "../theme-toggle";

interface NavItem {
    title: string;
    href: string;
}

const navItems: NavItem[] = [
    { title: "Dashboard", href: "/" },
    { title: "Shipments", href: "/shipments" },
    { title: "Carriers", href: "/carriers" },
    { title: "Analytics", href: "/analytics" },
    { title: "Settings", href: "/settings" }
];

interface HorizontalNavProps {
    onViewChange?: (view: "grid" | "tile") => void;
    currentView?: "grid" | "tile";
    showViewToggle?: boolean;
    onSearch?: (query: string) => void;
    onCreate?: () => void;
}

export function HorizontalNav({
    onViewChange,
    currentView = "tile",
    showViewToggle = false,
    onSearch,
    onCreate
}: HorizontalNavProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = React.useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(searchQuery);
    };

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4">
            {/* Sidebar Trigger */}
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-6" />

            {/* Breadcrumb / Page Title */}
            <div className="hidden md:flex items-center gap-2">
                <span className="font-medium">Dashboard</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden lg:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search shipments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-9 bg-muted/50 border-0 focus-visible:ring-1"
                />
            </form>

            {/* View Toggle */}
            {showViewToggle && (
                <TooltipProvider>
                    <div className="hidden sm:flex items-center gap-1 p-1 bg-muted rounded-lg">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={currentView === "grid" ? "secondary" : "ghost"}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onViewChange?.("grid")}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Grid View</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={currentView === "tile" ? "secondary" : "ghost"}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onViewChange?.("tile")}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Tile View</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            )}

            {/* Create Button */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="sm" className="hidden sm:flex gap-2" onClick={onCreate}>
                            <Plus className="h-4 w-4" />
                            <span className="hidden lg:inline">New Shipment</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="lg:hidden">New Shipment</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Notifications */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                3
                            </Badge>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full ml-2 h-8 w-8 border border-border/50">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/avatar.jpg" />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs">
                                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <span className="font-medium">{user?.name || 'User'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <span className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => logout()}
                    >
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ThemeToggle />
        </header>
    );
}
