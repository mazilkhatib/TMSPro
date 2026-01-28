"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { UPDATE_SHIPMENT } from "@/graphql/mutations";
import { GET_SHIPMENT } from "@/graphql/queries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editShipmentSchema, type EditShipmentForm } from "@/lib/validations/shipment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { HorizontalNav } from "@/components/layout/horizontal-nav";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Loader2, ArrowLeft, Package, Calendar as CalendarIcon, FileText, MapPin, Save, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Controller } from "react-hook-form";
import { ShipmentPriority, ShipmentStatus } from "@/types";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UpdateShipmentResponse {
    updateShipment: {
        id: string;
        trackingNumber: string;
    };
}

interface GetShipmentResponse {
    shipment: {
        id: string;
        trackingNumber: string;
        shipperName: string;
        carrierName: string;
        status: ShipmentStatus;
        priority: ShipmentPriority;
        rate: number;
        weight: number;
        estimatedDelivery: string;
        actualDelivery?: string;
        notes?: string;
        pickupLocation: {
            address: string;
            city: string;
            state: string;
            zip: string;
            country: string;
        };
        deliveryLocation: {
            address: string;
            city: string;
            state: string;
            zip: string;
            country: string;
        };
    };
}

export default function EditShipmentPage() {
    const router = useRouter();
    const params = useParams();
    const shipmentId = params.id as string;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<EditShipmentForm>({
        resolver: zodResolver(editShipmentSchema),
        defaultValues: {
            shipperName: "",
            carrierName: "",
            status: "" as any, // Will be populated from server data
            priority: "" as any, // Will be populated from server data
            rate: "",
            weight: "",
            estimatedDelivery: "",
            actualDelivery: "",
            notes: ""
        },
        mode: "onChange"
    });

    const { data: shipmentData, loading: isLoading, error: queryError } = useQuery<GetShipmentResponse>(GET_SHIPMENT, {
        variables: { id: shipmentId },
    });

    useEffect(() => {
        if (queryError) {
            toast.error("Failed to load shipment details", {
                description: queryError.message
            });
            router.push("/shipments");
        }
    }, [queryError, router]);

    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        if (shipmentData?.shipment) {
            const s = shipmentData.shipment;
            // Use setTimeout to ensure the form update happens after React's render cycle
            // This fixes the Select component not properly receiving values
            setTimeout(() => {
                form.reset({
                    shipperName: s.shipperName,
                    carrierName: s.carrierName,
                    status: s.status,
                    priority: s.priority,
                    rate: s.rate.toString(),
                    weight: s.weight.toString(),
                    estimatedDelivery: s.estimatedDelivery ? new Date(s.estimatedDelivery).toISOString().split('T')[0] : "",
                    actualDelivery: s.actualDelivery ? new Date(s.actualDelivery).toISOString().split('T')[0] : "",
                    notes: s.notes || ""
                }, { keepDefaultValues: false });
                setDataLoaded(true);
            }, 0);
        }
    }, [shipmentData, form]);

    const [updateShipment] = useMutation<UpdateShipmentResponse>(UPDATE_SHIPMENT, {
        onCompleted: () => {
            toast.success("Shipment updated successfully", {
                icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
            });
            router.push("/shipments");
        },
        onError: (error) => {
            toast.error("Failed to update shipment", {
                description: error.message
            });
            setIsSubmitting(false);
        }
    });

    const onSubmit = async (data: EditShipmentForm) => {
        setIsSubmitting(true);
        try {
            await updateShipment({
                variables: {
                    id: shipmentId,
                    input: {
                        shipperName: data.shipperName,
                        carrierName: data.carrierName,
                        status: data.status,
                        priority: data.priority,
                        rate: parseFloat(data.rate),
                        weight: parseFloat(data.weight),
                        estimatedDelivery: new Date(data.estimatedDelivery).toISOString(),
                        actualDelivery: data.actualDelivery ? new Date(data.actualDelivery).toISOString() : undefined,
                        notes: data.notes || undefined
                    }
                }
            });
        } catch (error) {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background/50 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <HorizontalNav
                        showBackButton
                        onBack={() => router.back()}
                    />

                    {/* Action Bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur z-10">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Edit Shipment</h1>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <span className="font-mono bg-muted px-1.5 py-0.5 rounded">#{shipmentData?.shipment.trackingNumber}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                                <span className="font-medium">{shipmentData?.shipment.status}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isSubmitting || !form.formState.isDirty}
                                className="min-w-[120px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <main className="flex-1 p-6 lg:p-8 bg-muted/10">
                        <div className="max-w-5xl mx-auto space-y-8">
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                                {/* Status & Priority Section - High Level Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Clock className="w-4 h-4 text-primary" />
                                                Current Status
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Controller
                                                control={form.control}
                                                name="status"
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={(value) => field.onChange(value)}
                                                    >
                                                        <SelectTrigger className="w-full h-12 text-lg font-medium">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="PENDING">Pending</SelectItem>
                                                            <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                                                            <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                                                            <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                                                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                                                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                                            <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card className={cn(
                                        "border-l-4 shadow-sm hover:shadow-md transition-shadow",
                                        form.watch("priority") === "URGENT" ? "border-l-red-500" :
                                            form.watch("priority") === "HIGH" ? "border-l-orange-500" :
                                                form.watch("priority") === "MEDIUM" ? "border-l-yellow-500" : "border-l-blue-500"
                                    )}>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <AlertTriangle className="w-4 h-4" />
                                                Priority Level
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Controller
                                                control={form.control}
                                                name="priority"
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={(value) => field.onChange(value)}
                                                    >
                                                        <SelectTrigger className="w-full h-12">
                                                            <SelectValue placeholder="Select priority" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="LOW">Low Priority</SelectItem>
                                                            <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                                                            <SelectItem value="HIGH">High Priority</SelectItem>
                                                            <SelectItem value="URGENT">Urgent Priority</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Main Form Content */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                    {/* Left Column - Core Info */}
                                    <div className="lg:col-span-2 space-y-8">
                                        <Card className="overflow-hidden border-border/60 shadow-sm">
                                            <CardHeader className="bg-muted/30 pb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <Package className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">Shipment Information</CardTitle>
                                                        <CardDescription>Core details about the shipper and carrier</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 grid gap-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label>Shipper Name *</Label>
                                                        <Input
                                                            {...form.register("shipperName")}
                                                            className={cn("h-10", form.formState.errors.shipperName && "border-destructive")}
                                                        />
                                                        {form.formState.errors.shipperName && (
                                                            <p className="text-xs text-destructive">{form.formState.errors.shipperName.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Carrier Name *</Label>
                                                        <Input
                                                            {...form.register("carrierName")}
                                                            className={cn("h-10", form.formState.errors.carrierName && "border-destructive")}
                                                        />
                                                        {form.formState.errors.carrierName && (
                                                            <p className="text-xs text-destructive">{form.formState.errors.carrierName.message}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                                    <div className="space-y-2">
                                                        <Label>Rate ($) *</Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                {...form.register("rate")}
                                                                className={cn("pl-7 h-10", form.formState.errors.rate && "border-destructive")}
                                                            />
                                                        </div>
                                                        {form.formState.errors.rate && (
                                                            <p className="text-xs text-destructive">{form.formState.errors.rate.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Weight (lbs) *</Label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                step="0.1"
                                                                {...form.register("weight")}
                                                                className={cn("pr-9 h-10", form.formState.errors.weight && "border-destructive")}
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">lbs</span>
                                                        </div>
                                                        {form.formState.errors.weight && (
                                                            <p className="text-xs text-destructive">{form.formState.errors.weight.message}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="overflow-hidden border-border/60 shadow-sm">
                                            <CardHeader className="bg-muted/30 pb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                                        <CalendarIcon className="w-5 h-5 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">Schedule & Timing</CardTitle>
                                                        <CardDescription>Estimated and actual delivery dates</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label>Estimated Delivery *</Label>
                                                    <Controller
                                                        control={form.control}
                                                        name="estimatedDelivery"
                                                        render={({ field }) => (
                                                            <DatePicker
                                                                date={field.value ? new Date(field.value) : undefined}
                                                                onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                                                                placeholder="Pick a date"
                                                            />
                                                        )}
                                                    />
                                                    {form.formState.errors.estimatedDelivery && (
                                                        <p className="text-xs text-destructive">{form.formState.errors.estimatedDelivery.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Actual Delivery</Label>
                                                    <Controller
                                                        control={form.control}
                                                        name="actualDelivery"
                                                        render={({ field }) => (
                                                            <DatePicker
                                                                date={field.value ? new Date(field.value) : undefined}
                                                                onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                                                                placeholder="Pick a date"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Right Column - Locations & Notes */}
                                    <div className="space-y-8">
                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-3 border-b">
                                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Locations</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <div className="p-4 border-b last:border-0 relative hover:bg-muted/20 transition-colors">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
                                                    <div className="flex items-start gap-3 pl-2">
                                                        <MapPin className="w-4 h-4 text-green-500 mt-1" />
                                                        <div className="space-y-1">
                                                            <p className="font-semibold text-sm">Pickup Location</p>
                                                            <div className="text-sm text-muted-foreground leading-relaxed">
                                                                <p>{shipmentData?.shipment.pickupLocation.address}</p>
                                                                <p>{shipmentData?.shipment.pickupLocation.city}, {shipmentData?.shipment.pickupLocation.state} {shipmentData?.shipment.pickupLocation.zip}</p>
                                                                <p>{shipmentData?.shipment.pickupLocation.country}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 relative hover:bg-muted/20 transition-colors">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                                                    <div className="flex items-start gap-3 pl-2">
                                                        <MapPin className="w-4 h-4 text-red-500 mt-1" />
                                                        <div className="space-y-1">
                                                            <p className="font-semibold text-sm">Delivery Location</p>
                                                            <div className="text-sm text-muted-foreground leading-relaxed">
                                                                <p>{shipmentData?.shipment.deliveryLocation.address}</p>
                                                                <p>{shipmentData?.shipment.deliveryLocation.city}, {shipmentData?.shipment.deliveryLocation.state} {shipmentData?.shipment.deliveryLocation.zip}</p>
                                                                <p>{shipmentData?.shipment.deliveryLocation.country}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-muted/50 p-3 text-xs text-center text-muted-foreground">
                                                    Locations cannot be changed after creation
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-primary" />
                                                    <CardTitle className="text-base">Additional Notes</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <Textarea
                                                    {...form.register("notes")}
                                                    placeholder="Add any notes..."
                                                    className="resize-none min-h-[150px]"
                                                />
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider >
        </ProtectedRoute >
    );
}
