"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { CREATE_SHIPMENT } from "@/graphql/mutations";
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
import { ShipmentPriority } from "@/types";
import { toast } from "sonner";

// Response types
interface CreateShipmentResponse {
    createShipment: {
        id: string;
        trackingNumber: string;
    };
}

interface FormData {
    shipperName: string;
    carrierName: string;
    priority: ShipmentPriority;
    rate: string;
    weight: string;
    estimatedDelivery: string;
    // Pickup Location
    pickupAddress: string;
    pickupCity: string;
    pickupState: string;
    pickupZip: string;
    pickupCountry: string;
    // Delivery Location
    deliveryAddress: string;
    deliveryCity: string;
    deliveryState: string;
    deliveryZip: string;
    deliveryCountry: string;
    notes?: string;
}

export default function NewShipmentPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        shipperName: "",
        carrierName: "",
        priority: "MEDIUM",
        rate: "",
        weight: "",
        estimatedDelivery: "",
        pickupAddress: "",
        pickupCity: "",
        pickupState: "",
        pickupZip: "",
        pickupCountry: "USA",
        deliveryAddress: "",
        deliveryCity: "",
        deliveryState: "",
        deliveryZip: "",
        deliveryCountry: "USA",
        notes: "",
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [createShipment] = useMutation<CreateShipmentResponse>(CREATE_SHIPMENT, {
        onCompleted: (data) => {
            toast.success(`Shipment ${data.createShipment.trackingNumber} created successfully`);
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

        // Pickup validation
        if (!formData.pickupAddress.trim()) newErrors.pickupAddress = "Pickup address is required";
        if (!formData.pickupCity.trim()) newErrors.pickupCity = "Pickup city is required";
        if (!formData.pickupState.trim()) newErrors.pickupState = "Pickup state is required";
        if (!formData.pickupZip.trim()) newErrors.pickupZip = "Pickup ZIP is required";

        // Delivery validation
        if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = "Delivery address is required";
        if (!formData.deliveryCity.trim()) newErrors.deliveryCity = "Delivery city is required";
        if (!formData.deliveryState.trim()) newErrors.deliveryState = "Delivery state is required";
        if (!formData.deliveryZip.trim()) newErrors.deliveryZip = "Delivery ZIP is required";

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
            await createShipment({
                variables: {
                    input: {
                        shipperName: formData.shipperName,
                        carrierName: formData.carrierName,
                        priority: formData.priority,
                        rate: parseFloat(formData.rate),
                        weight: parseFloat(formData.weight),
                        estimatedDelivery: new Date(formData.estimatedDelivery).toISOString(),
                        pickupLocation: {
                            address: formData.pickupAddress,
                            city: formData.pickupCity,
                            state: formData.pickupState,
                            zip: formData.pickupZip,
                            country: formData.pickupCountry
                        },
                        deliveryLocation: {
                            address: formData.deliveryAddress,
                            city: formData.deliveryCity,
                            state: formData.deliveryState,
                            zip: formData.deliveryZip,
                            country: formData.deliveryCountry
                        },
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
                            <h1 className="text-lg font-semibold">Create New Shipment</h1>
                        </div>
                    </div>

                    <main className="flex-1 p-6 bg-background">
                        <div className="max-w-4xl mx-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
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

                                            <div className="space-y-2 md:col-span-2">
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
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Pickup Location */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Pickup Location</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="pickupAddress">Address *</Label>
                                            <Input
                                                id="pickupAddress"
                                                value={formData.pickupAddress}
                                                onChange={(e) => handleChange("pickupAddress", e.target.value)}
                                                placeholder="Street address"
                                                className={errors.pickupAddress ? "border-destructive" : ""}
                                            />
                                            {errors.pickupAddress && (
                                                <p className="text-sm text-destructive">{errors.pickupAddress}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="pickupCity">City *</Label>
                                                <Input
                                                    id="pickupCity"
                                                    value={formData.pickupCity}
                                                    onChange={(e) => handleChange("pickupCity", e.target.value)}
                                                    placeholder="City"
                                                    className={errors.pickupCity ? "border-destructive" : ""}
                                                />
                                                {errors.pickupCity && (
                                                    <p className="text-sm text-destructive">{errors.pickupCity}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="pickupState">State *</Label>
                                                <Input
                                                    id="pickupState"
                                                    value={formData.pickupState}
                                                    onChange={(e) => handleChange("pickupState", e.target.value)}
                                                    placeholder="State"
                                                    className={errors.pickupState ? "border-destructive" : ""}
                                                />
                                                {errors.pickupState && (
                                                    <p className="text-sm text-destructive">{errors.pickupState}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="pickupZip">ZIP Code *</Label>
                                                <Input
                                                    id="pickupZip"
                                                    value={formData.pickupZip}
                                                    onChange={(e) => handleChange("pickupZip", e.target.value)}
                                                    placeholder="ZIP"
                                                    className={errors.pickupZip ? "border-destructive" : ""}
                                                />
                                                {errors.pickupZip && (
                                                    <p className="text-sm text-destructive">{errors.pickupZip}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="pickupCountry">Country</Label>
                                            <Input
                                                id="pickupCountry"
                                                value={formData.pickupCountry}
                                                onChange={(e) => handleChange("pickupCountry", e.target.value)}
                                                placeholder="Country"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Delivery Location */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Delivery Location</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="deliveryAddress">Address *</Label>
                                            <Input
                                                id="deliveryAddress"
                                                value={formData.deliveryAddress}
                                                onChange={(e) => handleChange("deliveryAddress", e.target.value)}
                                                placeholder="Street address"
                                                className={errors.deliveryAddress ? "border-destructive" : ""}
                                            />
                                            {errors.deliveryAddress && (
                                                <p className="text-sm text-destructive">{errors.deliveryAddress}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="deliveryCity">City *</Label>
                                                <Input
                                                    id="deliveryCity"
                                                    value={formData.deliveryCity}
                                                    onChange={(e) => handleChange("deliveryCity", e.target.value)}
                                                    placeholder="City"
                                                    className={errors.deliveryCity ? "border-destructive" : ""}
                                                />
                                                {errors.deliveryCity && (
                                                    <p className="text-sm text-destructive">{errors.deliveryCity}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="deliveryState">State *</Label>
                                                <Input
                                                    id="deliveryState"
                                                    value={formData.deliveryState}
                                                    onChange={(e) => handleChange("deliveryState", e.target.value)}
                                                    placeholder="State"
                                                    className={errors.deliveryState ? "border-destructive" : ""}
                                                />
                                                {errors.deliveryState && (
                                                    <p className="text-sm text-destructive">{errors.deliveryState}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="deliveryZip">ZIP Code *</Label>
                                                <Input
                                                    id="deliveryZip"
                                                    value={formData.deliveryZip}
                                                    onChange={(e) => handleChange("deliveryZip", e.target.value)}
                                                    placeholder="ZIP"
                                                    className={errors.deliveryZip ? "border-destructive" : ""}
                                                />
                                                {errors.deliveryZip && (
                                                    <p className="text-sm text-destructive">{errors.deliveryZip}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="deliveryCountry">Country</Label>
                                            <Input
                                                id="deliveryCountry"
                                                value={formData.deliveryCountry}
                                                onChange={(e) => handleChange("deliveryCountry", e.target.value)}
                                                placeholder="Country"
                                            />
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
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Shipment"
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
