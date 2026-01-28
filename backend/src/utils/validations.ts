import { z } from "zod";

// Location validation schema
export const locationSchema = z.object({
    address: z.string().min(1, "Address is required").max(200),
    city: z.string().min(1, "City is required").max(100),
    state: z.string().min(1, "State is required").max(50),
    zip: z.string().min(1, "ZIP code is required").max(20),
    country: z.string().max(50).default("USA")
});

// Registration validation schema
export const registerInputSchema = z.object({
    email: z.string()
        .email("Invalid email format")
        .min(1, "Email is required")
        .max(100),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(100),
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(100),
    role: z.enum(["admin", "employee"]).optional().default("employee")
});

// Login validation schema
export const loginInputSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
});

// Create shipment validation schema
export const createShipmentInputSchema = z.object({
    shipperName: z.string()
        .min(1, "Shipper name is required")
        .max(100),
    carrierName: z.string()
        .min(1, "Carrier name is required")
        .max(100),
    pickupLocation: locationSchema,
    deliveryLocation: locationSchema,
    rate: z.number().min(0, "Rate must be non-negative"),
    weight: z.number().min(0, "Weight must be non-negative"),
    estimatedDelivery: z.string().min(1, "Estimated delivery date is required"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
    notes: z.string().max(1000).optional()
});

// Update shipment validation schema
export const updateShipmentInputSchema = z.object({
    shipperName: z.string().min(1).max(100).optional(),
    carrierName: z.string().min(1).max(100).optional(),
    pickupLocation: locationSchema.optional(),
    deliveryLocation: locationSchema.optional(),
    status: z.enum(["PENDING", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "ON_HOLD"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    rate: z.number().min(0).optional(),
    weight: z.number().min(0).optional(),
    estimatedDelivery: z.string().optional(),
    actualDelivery: z.string().optional(),
    notes: z.string().max(1000).optional()
});

// Type exports
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type CreateShipmentInput = z.infer<typeof createShipmentInputSchema>;
export type UpdateShipmentInput = z.infer<typeof updateShipmentInputSchema>;
