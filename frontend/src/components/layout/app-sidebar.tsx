"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronDown,
    LayoutDashboard,
    Package,
    Truck,
    MapPin,
    BarChart3,
    Settings,
    Users,
    FileText,
    Bell,
    LogOut
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface NavItem {
    title: string;
    url?: string;
    icon: React.ElementType;
    badge?: string;
    items?: { title: string; url: string }[];
}

const navMain: NavItem[] = [
    {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard
    },
    {
        title: "Shipments",
        icon: Package,
        items: [
            { title: "All Shipments", url: "/shipments" },
            { title: "Create New", url: "/shipments/new" },
            { title: "In Transit", url: "/shipments?status=IN_TRANSIT" },
            { title: "Delivered", url: "/shipments?status=DELIVERED" }
        ]
    },
    {
        title: "Carriers",
        icon: Truck,
        items: [
            { title: "All Carriers", url: "/carriers" },
            { title: "Add Carrier", url: "/carriers/new" }
        ]
    },
    {
        title: "Locations",
        url: "/locations",
        icon: MapPin
    },
    {
        title: "Reports",
        icon: BarChart3,
        items: [
            { title: "Overview", url: "/reports" },
            { title: "Performance", url: "/reports/performance" },
            { title: "Costs", url: "/reports/costs" }
        ]
    }
];

const navSecondary: NavItem[] = [
    {
        title: "Users",
        url: "/users",
        icon: Users
    },
    {
        title: "Documents",
        url: "/documents",
        icon: FileText
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings
    }
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon">
            {/* Header */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-1">
                                    <Package className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <div className="grid flex-1 text-left leading-tight">
                                    <span className="truncate font-bold">TMS Pro</span>
                                    <span className="truncate text-xs text-muted-foreground">Transportation</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Main Navigation */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navMain.map((item) =>
                                item.items ? (
                                    <Collapsible key={item.title} asChild defaultOpen>
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton tooltip={item.title}>
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{item.title}</span>
                                                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.url}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={pathname === subItem.url}
                                                            >
                                                                <Link href={subItem.url}>
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                ) : (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.url}
                                            tooltip={item.title}
                                        >
                                            <Link href={item.url!}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                                {item.badge && (
                                                    <Badge className="ml-auto" variant="secondary">
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Secondary Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navSecondary.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url!}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer with User */}
            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" tooltip="John Doe (Admin)">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatar.jpg" />
                                <AvatarFallback className="bg-gradient-to-br from-chart-1 to-chart-2 text-white text-sm">
                                    JD
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-medium">John Doe</span>
                                <span className="text-xs text-muted-foreground">Admin</span>
                            </div>
                            <LogOut className="ml-auto h-4 w-4 text-muted-foreground" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
