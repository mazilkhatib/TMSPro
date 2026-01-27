"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { UPDATE_SHIPMENT } from "@/graphql/mutations";
import { GET_SHIPMENT } from "@/graphql/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Loader2, ArrowLeft } from "lucide-react";
import { ShipmentPriority, ShipmentStatus } from "@/types";
import { toast } from "sonner";

// Response types
interface CreateShipmentResponse {
    createShipment: {
        id: string;
        trackingNumber: string;
    };
}

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
        createdAt: string;
        updatedAt: string;
        flagged: boolean;
    };
}

interface FormData {
    shipperName: string;
    carrierName: string;
    status: ShipmentStatus;
    priority: ShipmentPriority;
    rate: string;
    weight: string;
    estimatedDelivery: string;
    actualDelivery: string;
    notes?: string;
}

export default function EditShipmentPage() {
    const router = useRouter();
    const params = useParams();
    const shipmentId = params.id as string;

    const [formData, setFormData] = useState<FormData>({
        shipperName: "",
        carrierName: "",
        status: "PENDING",
        priority: "MEDIUM",
        rate: "",
        weight: "",
        estimatedDelivery: "",
        actualDelivery: "",
        notes: "",
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch existing shipment data
    const { data: shipmentData, loading: isLoading, error: queryError } = useQuery<GetShipmentResponse>(GET_SHIPMENT, {
        variables: { id: shipmentId },
    });

    useEffect(() => {
        if (queryError) {
            toast.error("Failed to load shipment details");
            router.push("/shipments");
        }
    }, [queryError, router]);

    useEffect(() => {
        if (shipmentData?.shipment) {
            const s = shipmentData.shipment;
            setFormData({
                shipperName: s.shipperName,
                carrierName: s.carrierName,
                status: s.status,
                priority: s.priority,
                rate: s.rate.toString(),
                weight: s.weight.toString(),
                estimatedDelivery: s.estimatedDelivery ? new Date(s.estimatedDelivery).toISOString().split('T')[0] : "",
                actualDelivery: s.actualDelivery ? new Date(s.actualDelivery).toISOString().split('T')[0] : "",
                notes: s.notes || "",
            });
        }
    }, [shipmentData]);

    const [updateShipment] = useMutation<UpdateShipmentResponse>(UPDATE_SHIPMENT, {
        onCompleted: () => {
            toast.success("Shipment updated successfully");
            router.push("/shipments");
        },
        onError: (error) => {
            toast.error(error.message);
            setIsSubmitting(false);
        }
    });

    const validateForm = () => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.shipperName.trim()) newErrors.shipperName = "Shipper name is required";
        if (!formData.carrierName.trim()) newErrors.carrierName = "Carrier name is required";
        if (!formData.rate || isNaN(Number(formData.rate))) newErrors.rate = "Valid rate is required";
        if (!formData.weight || isNaN(Number(formData.weight))) newErrors.weight = "Valid weight is required";
        if (!formData.estimatedDelivery) newErrors.estimatedDelivery = "Estimated delivery date is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await updateShipment({
                variables: {
                    id: shipmentId,
                    input: {
                        shipperName: formData.shipperName,
                        carrierName: formData.carrierName,
                        status: formData.status,
                        priority: formData.priority,
                        rate: parseFloat(formData.rate),
                        weight: parseFloat(formData.weight),
                        estimatedDelivery: new Date(formData.estimatedDelivery).toISOString(),
                        actualDelivery: formData.actualDelivery ? new Date(formData.actualDelivery).toISOString() : undefined,
                        notes: formData.notes || undefined
                    }
                }
            });
        } catch (error) {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <div className="flex h-14 items-center gap-4 border-b px-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold">Edit Shipment</h1>
                        </div>
                    </div>

                    <main className="flex-1 p-6 bg-background">
                        <div className="max-w-4xl mx-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Shipment Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="shipperName">Shipper Name *</Label>
                                                <Input
                                                    id="shipperName"
                                                    value={formData.shipperName}
                                                    onChange={(e) => handleChange("shipperName", e.target.value)}
                                                    placeholder="Enter shipper name"
                                                    className={errors.shipperName ? "border-destructive" : ""}
                                                />
                                                {errors.shipperName && (
                                                    <p className="text-sm text-destructive">{errors.shipperName}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="carrierName">Carrier Name *</Label>
                                                <Input
                                                    id="carrierName"
                                                    value={formData.carrierName}
                                                    onChange={(e) => handleChange("carrierName", e.target.value)}
                                                    placeholder="Enter carrier name"
                                                    className={errors.carrierName ? "border-destructive" : ""}
                                                />
                                                {errors.carrierName && (
                                                    <p className="text-sm text-destructive">{errors.carrierName}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="status">Status</Label>
                                                <Select
                                                    value={formData.status}
                                                    onValueChange={(value) => handleChange("status", value as ShipmentStatus)}
                                                >
                                                    <SelectTrigger id="status">
                                                        <SelectValue />
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
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="priority">Priority</Label>
                                                <Select
                                                    value={formData.priority}
                                                    onValueChange={(value) => handleChange("priority", value as ShipmentPriority)}
                                                >
                                                    <SelectTrigger id="priority">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="LOW">Low</SelectItem>
                                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                                        <SelectItem value="HIGH">High</SelectItem>
                                                        <SelectItem value="URGENT">Urgent</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="rate">Rate ($) *</Label>
                                                <Input
                                                    id="rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.rate}
                                                    onChange={(e) => handleChange("rate", e.target.value)}
                                                    placeholder="0.00"
                                                    className={errors.rate ? "border-destructive" : ""}
                                                />
                                                {errors.rate && (
                                                    <p className="text-sm text-destructive">{errors.rate}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="weight">Weight (lbs) *</Label>
                                                <Input
                                                    id="weight"
                                                    type="number"
                                                    step="0.1"
                                                    value={formData.weight}
                                                    onChange={(e) => handleChange("weight", e.target.value)}
                                                    placeholder="0.0"
                                                    className={errors.weight ? "border-destructive" : ""}
                                                />
                                                {errors.weight && (
                                                    <p className="text-sm text-destructive">{errors.weight}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="estimatedDelivery">Estimated Delivery Date *</Label>
                                                <Input
                                                    id="estimatedDelivery"
                                                    type="date"
                                                    value={formData.estimatedDelivery}
                                                    onChange={(e) => handleChange("estimatedDelivery", e.target.value)}
                                                    className={errors.estimatedDelivery ? "border-destructive" : ""}
                                                />
                                                {errors.estimatedDelivery && (
                                                    <p className="text-sm text-destructive">{errors.estimatedDelivery}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="actualDelivery">Actual Delivery Date</Label>
                                                <Input
                                                    id="actualDelivery"
                                                    type="date"
                                                    value={formData.actualDelivery}
                                                    onChange={(e) => handleChange("actualDelivery", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Notes */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Additional Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={formData.notes}
                                                onChange={(e) => handleChange("notes", e.target.value)}
                                                placeholder="Enter any additional notes..."
                                                rows={4}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Actions */}
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}
