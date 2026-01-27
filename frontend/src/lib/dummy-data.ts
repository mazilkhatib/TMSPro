import { Shipment, ShipmentStatus, ShipmentPriority } from "@/types";

// Generate random data for our dummy shipments
const shipperNames = [
    "Acme Corp", "Global Trade Inc", "Fast Freight LLC", "Prime Logistics",
    "Atlas Shipping", "Cargo Express", "Swift Delivery", "Horizon Freight",
    "Peak Transport", "Blue Wave Shipping"
];

const carrierNames = [
    "FedEx", "UPS", "DHL", "USPS", "XPO Logistics",
    "J.B. Hunt", "Schneider", "Old Dominion", "Estes Express", "YRC Freight"
];

const cities = [
    { city: "New York", state: "NY", zip: "10001" },
    { city: "Los Angeles", state: "CA", zip: "90001" },
    { city: "Chicago", state: "IL", zip: "60601" },
    { city: "Houston", state: "TX", zip: "77001" },
    { city: "Phoenix", state: "AZ", zip: "85001" },
    { city: "Philadelphia", state: "PA", zip: "19101" },
    { city: "San Antonio", state: "TX", zip: "78201" },
    { city: "San Diego", state: "CA", zip: "92101" },
    { city: "Dallas", state: "TX", zip: "75201" },
    { city: "Seattle", state: "WA", zip: "98101" },
    { city: "Denver", state: "CO", zip: "80201" },
    { city: "Boston", state: "MA", zip: "02101" },
];

const streets = [
    "123 Main St", "456 Oak Ave", "789 Industrial Blvd", "321 Commerce Dr",
    "654 Warehouse Way", "987 Distribution Ln", "741 Shipping Rd", "852 Freight Ave"
];

const statuses: ShipmentStatus[] = [
    "PENDING", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "ON_HOLD"
];

const priorities: ShipmentPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateTrackingNumber(): string {
    const prefix = "TMS";
    const randomNum = Math.floor(Math.random() * 1000000000).toString().padStart(9, "0");
    return `${prefix}${randomNum}`;
}

function generateDate(daysAgo: number, daysAhead: number = 0): string {
    const today = new Date();
    const offset = Math.floor(Math.random() * (daysAhead + daysAgo + 1)) - daysAgo;
    const date = new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);
    return date.toISOString();
}

function generateLocation() {
    const cityData = getRandomItem(cities);
    return {
        address: getRandomItem(streets),
        city: cityData.city,
        state: cityData.state,
        zip: cityData.zip,
        country: "USA"
    };
}

export function generateDummyShipments(count: number = 50): Shipment[] {
    const shipments: Shipment[] = [];

    for (let i = 1; i <= count; i++) {
        const status = getRandomItem(statuses);
        const createdAt = generateDate(30);
        const estimatedDelivery = generateDate(-5, 14);

        shipments.push({
            id: `ship_${i.toString().padStart(5, "0")}`,
            shipperName: getRandomItem(shipperNames),
            carrierName: getRandomItem(carrierNames),
            pickupLocation: generateLocation(),
            deliveryLocation: generateLocation(),
            trackingNumber: generateTrackingNumber(),
            status,
            priority: getRandomItem(priorities),
            rate: Math.floor(Math.random() * 5000) + 100,
            weight: Math.floor(Math.random() * 10000) + 10,
            estimatedDelivery,
            actualDelivery: status === "DELIVERED" ? generateDate(-7, 0) : undefined,
            flagged: Math.random() > 0.85,
            notes: Math.random() > 0.7 ? "Handle with care - fragile items" : undefined,
            createdAt,
            updatedAt: createdAt
        });
    }

    return shipments;
}

// Pre-generated dummy data for the frontend
export const dummyShipments = generateDummyShipments(50);
