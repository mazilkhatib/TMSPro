import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ViewSwitcherProps {
    className?: string;
}

export function ViewSwitcher({ className }: ViewSwitcherProps) {
    return (
        <TabsList className={cn("grid w-auto grid-cols-2", className)}>
            <TabsTrigger value="grid" className="px-3">
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only">Grid View</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="px-3">
                <List className="h-4 w-4" />
                <span className="sr-only">List View</span>
            </TabsTrigger>
        </TabsList>
    );
}
