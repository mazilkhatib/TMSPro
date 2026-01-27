// Shipment types for the TMS application

export interface Location {
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

export interface Shipment {
    id: string;
    shipperName: string;
    carrierName: string;
    pickupLocation: Location;
    deliveryLocation: Location;
    trackingNumber: string;
    status: ShipmentStatus;
    priority: ShipmentPriority;
    rate: number;
    weight: number;
    estimatedDelivery: string;
    actualDelivery?: string;
    flagged: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ShipmentFilter {
    status?: ShipmentStatus;
    priority?: ShipmentPriority;
    carrierName?: string;
    search?: string;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ShipmentConnection {
    shipments: Shipment[];
    pagination: PaginationInfo;
}

// User and authentication types
export type UserRole = "admin" | "employee";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}
