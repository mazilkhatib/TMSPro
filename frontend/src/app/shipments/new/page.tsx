"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { CREATE_SHIPMENT } from "@/graphql/mutations";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createShipmentSchema,
    type CreateShipmentForm
} from "@/lib/validations/shipment";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { HorizontalNav } from "@/components/layout/horizontal-nav";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
    Loader2,
    ArrowLeft,
    Package,
    MapPin,
    Calendar as CalendarIcon,
    FileText,
    Info,
    Copy,
    CheckCircle2,
    AlertCircle,
    Truck,
    Clock,
    DollarSign,
    Scale
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Controller } from "react-hook-form";
import { MultiStepForm, StepNavigation } from "@/components/common/multi-step-form";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreateShipmentResponse {
    createShipment: {
        id: string;
        trackingNumber: string;
    };
}

const steps = [
    {
        id: "basic",
        title: "Basic Info",
        description: "Shipper & Carrier",
        icon: <Package className="w-5 h-5" />
    },
    {
        id: "details",
        title: "Shipment Details",
        description: "Rate, Weight & Date",
        icon: <CalendarIcon className="w-5 h-5" />
    },
    {
        id: "pickup",
        title: "Pickup Location",
        description: "Where to pick up",
        icon: <MapPin className="w-5 h-5" />
    },
    {
        id: "delivery",
        title: "Delivery Location",
        description: "Where to deliver",
        icon: <MapPin className="w-5 h-5" />
    },
    {
        id: "review",
        title: "Review & Notes",
        description: "Finalize",
        icon: <FileText className="w-5 h-5" />
    }
];

// Local storage key for auto-save
const STORAGE_KEY = "shipment_draft";

export default function NewShipmentPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const form = useForm<CreateShipmentForm>({
        resolver: zodResolver(createShipmentSchema),
        defaultValues: {
            shipperName: "",
            carrierName: "",
            priority: "MEDIUM",
            rate: "",
            weight: "",
            estimatedDelivery: "",
            pickupLocation: {
                address: "",
                city: "",
                state: "",
                zip: "",
                country: "USA"
            },
            deliveryLocation: {
                address: "",
                city: "",
                state: "",
                zip: "",
                country: "USA"
            },
            notes: ""
        },
        mode: "onChange"
    });

    const { formState: { errors, dirtyFields }, watch } = form;
    const formData = watch();

    // Load draft from localStorage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem(STORAGE_KEY);
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                form.reset(draft);
                setHasUnsavedChanges(true);
                toast.info("Draft restored from previous session", {
                    action: {
                        label: "Clear",
                        onClick: () => {
                            localStorage.removeItem(STORAGE_KEY);
                            form.reset();
                            setHasUnsavedChanges(false);
                        }
                    }
                });
            } catch (e) {
                console.error("Failed to load draft:", e);
            }
        }
    }, [form]);

    // Auto-save to localStorage
    useEffect(() => {
        if (Object.keys(dirtyFields).length > 0) {
            setHasUnsavedChanges(true);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        }
    }, [formData, dirtyFields]);

    const [createShipment] = useMutation<CreateShipmentResponse>(CREATE_SHIPMENT, {
        onCompleted: (data) => {
            localStorage.removeItem(STORAGE_KEY);
            setHasUnsavedChanges(false);
            toast.success(`Shipment ${data.createShipment.trackingNumber} created successfully`, {
                icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
            });
            router.push("/shipments");
        },
        onError: (error) => {
            toast.error(error.message, {
                icon: <AlertCircle className="w-5 h-5 text-red-500" />
            });
            setIsSubmitting(false);
        }
    });

    const handleNext = async () => {
        const fieldsToValidate = getFieldsForStep(currentStep);
        const isValid = await form.trigger(fieldsToValidate as any, { shouldFocus: true });

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            // Scroll to first error
            const firstError = document.querySelector('[data-error="true"]');
            if (firstError) {
                firstError.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleStepClick = (stepIndex: number) => {
        if (stepIndex <= currentStep) {
            setCurrentStep(stepIndex);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const onSubmit = async (data: CreateShipmentForm) => {
        setIsSubmitting(true);

        try {
            await createShipment({
                variables: {
                    input: {
                        shipperName: data.shipperName,
                        carrierName: data.carrierName,
                        priority: data.priority,
                        rate: parseFloat(data.rate),
                        weight: parseFloat(data.weight),
                        estimatedDelivery: new Date(data.estimatedDelivery).toISOString(),
                        pickupLocation: data.pickupLocation,
                        deliveryLocation: data.deliveryLocation,
                        notes: data.notes || undefined
                    }
                }
            });
        } catch (error) {
            setIsSubmitting(false);
        }
    };

    const getFieldsForStep = (step: number) => {
        switch (step) {
            case 0:
                return ["shipperName", "carrierName", "priority"];
            case 1:
                return ["rate", "weight", "estimatedDelivery"];
            case 2:
                return ["pickupLocation.address", "pickupLocation.city", "pickupLocation.state", "pickupLocation.zip", "pickupLocation.country"];
            case 3:
                return ["deliveryLocation.address", "deliveryLocation.city", "deliveryLocation.state", "deliveryLocation.zip", "deliveryLocation.country"];
            case 4:
                return ["notes"];
            default:
                return [];
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return renderBasicInfo();
            case 1:
                return renderShipmentDetails();
            case 2:
                return renderPickupLocation();
            case 3:
                return renderDeliveryLocation();
            case 4:
                return renderReviewAndNotes();
            default:
                return null;
        }
    };



    const renderBasicInfo = () => (
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm ring-1 ring-border/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50 py-5 px-6">
                <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                        <Package className="w-5 h-5 text-primary" />
                    </div>
                    Basic Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        label="Shipper Name"
                        required
                        error={errors.shipperName}
                        helpText="The company or individual sending the shipment"
                        icon={<Package className="w-4 h-4" />}
                    >
                        <Input
                            {...form.register("shipperName")}
                            placeholder="e.g., Global logistics Inc."
                            className={cn(
                                "h-12 text-base transition-all duration-300",
                                "hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10",
                                "bg-background/50 backdrop-blur-sm",
                                errors.shipperName && "border-destructive/50 focus:border-destructive focus:ring-destructive/10"
                            )}
                            data-error={!!errors.shipperName}
                        />
                    </FormField>

                    <FormField
                        label="Carrier Name"
                        required
                        error={errors.carrierName}
                        helpText="The shipping company handling the delivery"
                        icon={<Truck className="w-4 h-4" />}
                    >
                        <Input
                            {...form.register("carrierName")}
                            placeholder="e.g., FedEx Express"
                            className={cn(
                                "h-12 text-base transition-all duration-300",
                                "hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10",
                                "bg-background/50 backdrop-blur-sm",
                                errors.carrierName && "border-destructive/50 focus:border-destructive focus:ring-destructive/10"
                            )}
                            data-error={!!errors.carrierName}
                        />
                    </FormField>

                    <div className="space-y-3 md:col-span-2">
                        <Label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            Priority Level
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {["LOW", "MEDIUM", "HIGH", "URGENT"].map((level) => (
                                <label
                                    key={level}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                                        "hover:bg-accent/50",
                                        form.watch("priority") === level
                                            ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                                            : "border-border/50 bg-card/50 opacity-70 hover:opacity-100"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        value={level}
                                        {...form.register("priority")}
                                        className="sr-only"
                                        onChange={() => {
                                            form.setValue("priority", level as any);
                                            setHasUnsavedChanges(true);
                                        }}
                                    />
                                    <div className={cn(
                                        "w-3 h-3 rounded-full mb-2 shadow-sm",
                                        level === "LOW" && "bg-blue-500",
                                        level === "MEDIUM" && "bg-yellow-500",
                                        level === "HIGH" && "bg-orange-500",
                                        level === "URGENT" && "bg-red-500 animate-pulse"
                                    )} />
                                    <span className="text-sm font-semibold tracking-wide">
                                        {level}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderShipmentDetails = () => (
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm ring-1 ring-border/50 overflow-hidden rounded-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-b border-border/50 py-4 px-6">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                    <div className="p-2 rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
                        <CalendarIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    Shipment Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        label="Shipping Rate"
                        required
                        error={errors.rate}
                        helpText="Cost in USD (e.g., 99.99)"
                        icon={<DollarSign className="w-4 h-4" />}
                    >
                        <div className="relative group/input">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium group-focus-within/input:text-primary transition-colors">$</span>
                            <Input
                                type="number"
                                step="0.01"
                                {...form.register("rate")}
                                placeholder="0.00"
                                className={cn(
                                    "pl-8 h-12 text-lg font-medium transition-all duration-300",
                                    "hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10",
                                    "bg-background/50 backdrop-blur-sm",
                                    errors.rate && "border-destructive/50 focus:border-destructive focus:ring-destructive/10"
                                )}
                                data-error={!!errors.rate}
                            />
                        </div>
                    </FormField>

                    <FormField
                        label="Weight"
                        required
                        error={errors.weight}
                        helpText="Weight in pounds (lbs)"
                        icon={<Scale className="w-4 h-4" />}
                    >
                        <div className="relative group/input">
                            <Input
                                type="number"
                                step="0.1"
                                {...form.register("weight")}
                                placeholder="0.0"
                                className={cn(
                                    "pr-12 h-12 text-lg font-medium transition-all duration-300",
                                    "hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10",
                                    "bg-background/50 backdrop-blur-sm",
                                    errors.weight && "border-destructive/50 focus:border-destructive focus:ring-destructive/10"
                                )}
                                data-error={!!errors.weight}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground group-focus-within/input:text-primary transition-colors">lbs</span>
                        </div>
                    </FormField>

                    <div className="md:col-span-2">
                        <FormField
                            label="Estimated Delivery Date"
                            required
                            error={errors.estimatedDelivery}
                            helpText="When do you expect the shipment to be delivered?"
                        >
                            <Controller
                                control={form.control}
                                name="estimatedDelivery"
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value ? new Date(field.value) : undefined}
                                        onSelect={(date) => {
                                            field.onChange(date ? date.toISOString() : "");
                                            setHasUnsavedChanges(true); // Manually trigger this for now if needed, though form watching handles it usually
                                        }}
                                        placeholder="Pick a date"
                                    />
                                )}
                            />
                        </FormField>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderLocationField = (prefix: "pickupLocation" | "deliveryLocation", title: string, colorClass: string, iconColorClass: string) => (
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm ring-1 ring-border/50 overflow-hidden rounded-xl">
            <CardHeader className={`bg-gradient-to-r ${colorClass} border-b border-border/50 py-4 px-6`}>
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                    <div className={`p-2 rounded-lg bg-background/60 ring-1 ring-black/5`}>
                        <MapPin className={`w-5 h-5 ${iconColorClass}`} />
                    </div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6">
                <FormField
                    label="Street Address"
                    required
                    error={errors[prefix]?.address}
                    helpText="Full street address including building/suite number"
                >
                    <Input
                        {...form.register(`${prefix}.address` as const)}
                        placeholder="123 Main Street, Suite 100"
                        className={cn(
                            "h-12 text-base transition-all duration-300",
                            "hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10",
                            "bg-background/50 backdrop-blur-sm",
                            errors[prefix]?.address && "border-destructive/50"
                        )}
                        data-error={!!errors[prefix]?.address}
                    />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    <div className="md:col-span-3">
                        <FormField
                            label="City"
                            required
                            error={errors[prefix]?.city}
                        >
                            <Input
                                {...form.register(`${prefix}.city` as const)}
                                placeholder="New York"
                                className={cn(
                                    "h-12 transition-all duration-300",
                                    "hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10",
                                    errors[prefix]?.city && "border-destructive/50"
                                )}
                                data-error={!!errors[prefix]?.city}
                            />
                        </FormField>
                    </div>

                    <div className="md:col-span-1">
                        <FormField
                            label="State"
                            required
                            error={errors[prefix]?.state}
                        >
                            <Input
                                {...form.register(`${prefix}.state` as const)}
                                placeholder="NY"
                                maxLength={2}
                                className={cn(
                                    "h-12 transition-all duration-300 uppercase",
                                    "hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10",
                                    errors[prefix]?.state && "border-destructive/50"
                                )}
                                data-error={!!errors[prefix]?.state}
                            />
                        </FormField>
                    </div>

                    <div className="md:col-span-2">
                        <FormField
                            label="ZIP Code"
                            required
                            error={errors[prefix]?.zip}
                        >
                            <Input
                                {...form.register(`${prefix}.zip` as const)}
                                placeholder="10001"
                                maxLength={10}
                                className={cn(
                                    "h-12 transition-all duration-300",
                                    "hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10",
                                    errors[prefix]?.zip && "border-destructive/50"
                                )}
                                data-error={!!errors[prefix]?.zip}
                            />
                        </FormField>
                    </div>
                </div>

                <div className="md:w-1/2">
                    <FormField
                        label="Country"
                        error={errors[prefix]?.country}
                    >
                        <Input
                            {...form.register(`${prefix}.country` as const)}
                            placeholder="USA"
                            className="h-12"
                            data-error={!!errors[prefix]?.country}
                        />
                    </FormField>
                </div>
            </CardContent>
        </Card>
    );

    const renderPickupLocation = () => renderLocationField(
        "pickupLocation",
        "Pickup Location",
        "from-emerald-500/10 via-emerald-500/5 to-transparent",
        "text-emerald-500"
    );
    const renderDeliveryLocation = () => renderLocationField(
        "deliveryLocation",
        "Delivery Location",
        "from-rose-500/10 via-rose-500/5 to-transparent",
        "text-rose-500"
    );

    const renderReviewAndNotes = () => {
        return (
            <div className="space-y-6">
                <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                    <CardHeader className="bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent border-b border-border/50 pb-6">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2.5 rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20 shadow-inner">
                                <FileText className="w-6 h-6 text-violet-500" />
                            </div>
                            Review Shipment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 px-6 lg:px-8">
                        <div className="space-y-6">
                            <ReviewSection label="Basic Information" fields={[
                                { label: "Shipper", value: formData.shipperName },
                                { label: "Carrier", value: formData.carrierName },
                                { label: "Priority", value: formData.priority, color: getPriorityColor(formData.priority) }
                            ]} />

                            <ReviewSection label="Shipment Details" fields={[
                                { label: "Rate", value: `$${formData.rate}` },
                                { label: "Weight", value: `${formData.weight} lbs` },
                                { label: "Estimated Delivery", value: formData.estimatedDelivery ? new Date(formData.estimatedDelivery).toLocaleDateString() : "" }
                            ]} />

                            <ReviewSection label="Pickup Location" fields={[
                                { label: "Address", value: formData.pickupLocation.address },
                                { label: "City, State, ZIP", value: `${formData.pickupLocation.city}, ${formData.pickupLocation.state} ${formData.pickupLocation.zip}` },
                                { label: "Country", value: formData.pickupLocation.country }
                            ]} />

                            <ReviewSection label="Delivery Location" fields={[
                                { label: "Address", value: formData.deliveryLocation.address },
                                { label: "City, State, ZIP", value: `${formData.deliveryLocation.city}, ${formData.deliveryLocation.state} ${formData.deliveryLocation.zip}` },
                                { label: "Country", value: formData.deliveryLocation.country }
                            ]} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg ring-1 ring-border/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" />
                            Additional Notes (Optional)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            {...form.register("notes")}
                            placeholder="Enter any special instructions, handling requirements, or additional notes..."
                            rows={4}
                            className={cn(
                                "resize-none transition-all duration-300 min-h-[120px]",
                                "focus:ring-2 focus:ring-primary/20 bg-muted/30"
                            )}
                        />
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-muted-foreground">
                                {(form.watch("notes") || "").length} / 1000 characters
                            </p>
                            <AnimatePresence>
                                {(form.watch("notes") || "").length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex items-center gap-1.5 text-xs font-medium text-emerald-500"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Saved</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>

                {/* Confirmation Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent rounded-xl p-5 border border-emerald-500/20"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-emerald-500/20 flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base">Ready to Create Shipment</h3>
                            <p className="text-sm text-muted-foreground">
                                Please review all the details above before submitting. Once created, a unique tracking number will be generated for this shipment.
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-sm text-emerald-600 font-medium">
                                <span className="inline-flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Click "Create Shipment" below to proceed
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "LOW": return "bg-blue-500 shadow-blue-500/50";
            case "MEDIUM": return "bg-yellow-500 shadow-yellow-500/50";
            case "HIGH": return "bg-orange-500 shadow-orange-500/50";
            case "URGENT": return "bg-red-500 shadow-red-500/50";
            default: return "bg-gray-500";
        }
    };



    const isStepValid = () => {
        const fields = getFieldsForStep(currentStep);
        return !fields.some(field => {
            if (field.includes(".")) {
                const parts = field.split(".");
                const error = parts.reduce((obj: any, key) => obj?.[key], errors);
                return !!error;
            }
            return !!(errors as any)[field];
        });
    };

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <HorizontalNav
                        showBackButton
                        onBack={() => router.back()}
                    />
                    {/* Premium Header with gradient accent */}
                    <div className="relative px-6 lg:px-10 py-5 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

                        <div className="relative flex items-center justify-between">
                            <div className="space-y-0.5">
                                <motion.h1
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-2xl font-bold tracking-tight"
                                >
                                    Create New Shipment
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-sm text-muted-foreground"
                                >
                                    Step {currentStep + 1} of {steps.length} — {steps[currentStep]?.title}
                                </motion.p>
                            </div>
                            <AnimatePresence>
                                {hasUnsavedChanges && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                        className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 shadow-sm backdrop-blur-sm"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        Draft Saved
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <main className="flex-1 px-6 lg:px-10 mt-10 pb-8 bg-gradient-to-b from-transparent via-background to-background">
                        <div className="max-w-5xl mx-auto">
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <MultiStepForm
                                    steps={steps}
                                    currentStep={currentStep}
                                    onStepClick={handleStepClick}
                                    className="mb-10"
                                >
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="mt-8"
                                    >
                                        {renderStep()}
                                    </motion.div>
                                </MultiStepForm>

                                <StepNavigation
                                    currentStep={currentStep}
                                    totalSteps={steps.length}
                                    onPrevious={handlePrevious}
                                    onNext={handleNext}
                                    isNextDisabled={false}
                                    isPreviousDisabled={false}
                                    isSubmitting={isSubmitting}
                                    isValid={isStepValid()}
                                    submitLabel="Create Shipment"
                                    hasUnsavedChanges={hasUnsavedChanges}
                                />
                            </form>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}

// Helper component for form fields with validation
const FormField = ({ label, required, error, children, helpText, icon }: {
    label: string;
    required?: boolean;
    error?: any;
    children: React.ReactNode;
    helpText?: string;
    icon?: React.ReactNode;
}) => (
    <motion.div
        className="space-y-2 group"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground/80 group-focus-within:text-primary transition-colors">
                {icon && <span className="text-muted-foreground group-focus-within:text-primary">{icon}</span>}
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {helpText && (
                <div className="group/help relative">
                    <Info className="w-4 h-4 text-muted-foreground/50 hover:text-primary cursor-help transition-colors" />
                    <div className="absolute bottom-full right-0 mb-2 w-56 p-2.5 bg-popover text-popover-foreground text-xs rounded-xl shadow-xl border border-border/50 opacity-0 group-hover/help:opacity-100 transition-all duration-200 pointer-events-none z-50 backdrop-blur-md">
                        {helpText}
                        <div className="absolute -bottom-1 right-1 w-2 h-2 bg-popover rotate-45 border-b border-r border-border/50"></div>
                    </div>
                </div>
            )}
        </div>
        {children}
        <AnimatePresence>
            {error && (
                <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    className="flex items-center gap-1.5 text-xs font-medium text-destructive px-1"
                >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error.message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
);

const ReviewSection = ({ label, fields }: { label: string; fields: Array<{ label: string; value: string; color?: string }> }) => (
    <div className="pb-6 border-b last:border-0 last:pb-0">
        <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider mb-4">{label}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
            {fields.map((field, i) => (
                <div key={i} className="group">
                    <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors mb-1">{field.label}</p>
                    <div className="flex items-center gap-2">
                        {field.color && <div className={`w-2.5 h-2.5 rounded-full ${field.color} shadow-sm ring-1 ring-white/20`} />}
                        <p className="text-sm font-medium text-foreground break-words">{field.value || <span className="text-muted-foreground italic">Not specified</span>}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
