"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
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
            { title: "Create New", url: "/shipments/new" }
        ]
    }
];

const navSecondary: NavItem[] = [];

export function AppSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

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
            </SidebarContent>

            {/* Footer with User */}
            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" tooltip={`${user?.name || 'User'} (${user?.role || 'Guest'})`}>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatar.jpg" />
                                <AvatarFallback className="bg-gradient-to-br from-chart-1 to-chart-2 text-white text-sm">
                                    {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-medium">{user?.name || 'User'}</span>
                                <span className="text-xs text-muted-foreground capitalize">{user?.role || 'Guest'}</span>
                            </div>
                            <LogOut
                                className="ml-auto h-4 w-4 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    logout();
                                }}
                            />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
