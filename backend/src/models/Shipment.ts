import mongoose, { Schema, Document } from "mongoose";

export interface ILocation {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export type ShipmentStatus =
    | "PENDING"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | "ON_HOLD";

export type ShipmentPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface IShipment extends Document {
    shipperName: string;
    carrierName: string;
    pickupLocation: ILocation;
    deliveryLocation: ILocation;
    trackingNumber: string;
    status: ShipmentStatus;
    priority: ShipmentPriority;
    rate: number;
    weight: number;
    estimatedDelivery: Date;
    actualDelivery?: Date;
    flagged: boolean;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
    {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true, default: "USA" }
    },
    { _id: false }
);

const ShipmentSchema = new Schema<IShipment>(
    {
        shipperName: {
            type: String,
            required: true,
            index: true
        },
        carrierName: {
            type: String,
            required: true,
            index: true
        },
        pickupLocation: {
            type: LocationSchema,
            required: true
        },
        deliveryLocation: {
            type: LocationSchema,
            required: true
        },
        trackingNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        status: {
            type: String,
            enum: ["PENDING", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "ON_HOLD"],
            default: "PENDING",
            index: true
        },
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
            default: "MEDIUM",
            index: true
        },
        rate: {
            type: Number,
            required: true,
            min: 0
        },
        weight: {
            type: Number,
            required: true,
            min: 0
        },
        estimatedDelivery: {
            type: Date,
            required: true,
            index: true
        },
        actualDelivery: {
            type: Date
        },
        flagged: {
            type: Boolean,
            default: false,
            index: true
        },
        notes: {
            type: String
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for common queries
ShipmentSchema.index({ status: 1, createdAt: -1 });
ShipmentSchema.index({ carrierName: 1, status: 1 });
ShipmentSchema.index({ shipperName: 1, createdAt: -1 });

// Text index for search
ShipmentSchema.index({
    trackingNumber: "text",
    shipperName: "text",
    carrierName: "text"
});

export const Shipment = mongoose.model<IShipment>("Shipment", ShipmentSchema);
