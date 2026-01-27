import { z } from "zod";

// Basic Information Schema
export const basicInfoSchema = z.object({
    shipperName: z.string()
        .min(2, "Shipper name must be at least 2 characters")
        .max(100, "Shipper name must not exceed 100 characters"),
    carrierName: z.string()
        .min(2, "Carrier name must be at least 2 characters")
        .max(100, "Carrier name must not exceed 100 characters"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
});

// Shipment Details Schema
export const shipmentDetailsSchema = z.object({
    rate: z.string()
        .min(1, "Rate is required")
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: "Rate must be a positive number"
        }),
    weight: z.string()
        .min(1, "Weight is required")
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: "Weight must be a positive number"
        }),
    estimatedDelivery: z.string()
        .min(1, "Estimated delivery date is required")
        .refine((val) => {
            const date = new Date(val);
            return !isNaN(date.getTime());
        }, {
            message: "Invalid date format"
        })
});

// Location Schema (reusable for both pickup and delivery)
export const locationSchema = z.object({
    address: z.string()
        .min(5, "Address must be at least 5 characters")
        .max(200, "Address must not exceed 200 characters"),
    city: z.string()
        .min(2, "City must be at least 2 characters")
        .max(100, "City must not exceed 100 characters"),
    state: z.string()
        .min(2, "State must be at least 2 characters")
        .max(100, "State must not exceed 100 characters"),
    zip: z.string()
        .min(3, "ZIP code must be at least 3 characters")
        .max(20, "ZIP code must not exceed 20 characters"),
    country: z.string()
        .min(2, "Country must be at least 2 characters")
        .max(100, "Country must not exceed 100 characters")
});

// Additional Notes Schema
export const notesSchema = z.object({
    notes: z.string()
        .max(1000, "Notes must not exceed 1000 characters")
        .optional()
});

// Combined Create Shipment Schema
export const createShipmentSchema = basicInfoSchema
    .and(shipmentDetailsSchema)
    .and(z.object({
        pickupLocation: locationSchema,
        deliveryLocation: locationSchema
    }))
    .and(notesSchema);

// Edit Shipment specific schemas
export const editBasicInfoSchema = z.object({
    shipperName: z.string()
        .min(2, "Shipper name must be at least 2 characters")
        .max(100, "Shipper name must not exceed 100 characters"),
    carrierName: z.string()
        .min(2, "Carrier name must be at least 2 characters")
        .max(100, "Carrier name must not exceed 100 characters"),
    status: z.enum(["PENDING", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "ON_HOLD"]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
});

export const editShipmentDetailsSchema = z.object({
    rate: z.string()
        .min(1, "Rate is required")
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: "Rate must be a positive number"
        }),
    weight: z.string()
        .min(1, "Weight is required")
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: "Weight must be a positive number"
        }),
    estimatedDelivery: z.string()
        .min(1, "Estimated delivery date is required")
        .refine((val) => {
            const date = new Date(val);
            return !isNaN(date.getTime());
        }, {
            message: "Invalid date format"
        }),
    actualDelivery: z.string().optional()
});

// Combined Edit Shipment Schema
export const editShipmentSchema = editBasicInfoSchema
    .and(editShipmentDetailsSchema)
    .and(notesSchema);

// Type exports
export type BasicInfoForm = z.infer<typeof basicInfoSchema>;
export type ShipmentDetailsForm = z.infer<typeof shipmentDetailsSchema>;
export type LocationForm = z.infer<typeof locationSchema>;
export type NotesForm = z.infer<typeof notesSchema>;
export type CreateShipmentForm = z.infer<typeof createShipmentSchema>;
export type EditShipmentForm = z.infer<typeof editShipmentSchema>;
