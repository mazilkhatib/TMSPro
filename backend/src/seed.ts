import "dotenv/config";
import mongoose from "mongoose";
import { Shipment, User } from "./models";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tms";

// Sample data generators
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

const statuses = [
    "PENDING", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "ON_HOLD"
] as const;

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

function getRandomItem<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateTrackingNumber(): string {
    const prefix = "TMS";
    const randomNum = Math.floor(Math.random() * 1000000000).toString().padStart(9, "0");
    return `${prefix}${randomNum}`;
}

function generateDate(daysAgo: number, daysAhead: number = 0): Date {
    const today = new Date();
    const offset = Math.floor(Math.random() * (daysAhead + daysAgo + 1)) - daysAgo;
    return new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);
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

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Shipment.deleteMany({})
        ]);
        console.log("🗑️  Cleared existing data");

        // Create users
        const adminUser = new User({
            email: "admin@tms.com",
            password: "admin123",
            name: "John Admin",
            role: "admin"
        });
        await adminUser.save();

        const employeeUser = new User({
            email: "employee@tms.com",
            password: "employee123",
            name: "Jane Employee",
            role: "employee"
        });
        await employeeUser.save();

        console.log("👤 Created users:");
        console.log("   Admin: admin@tms.com / admin123");
        console.log("   Employee: employee@tms.com / employee123");

        // Create shipments
        const shipments = [];
        for (let i = 0; i < 50; i++) {
            const status = getRandomItem(statuses);
            const createdAt = generateDate(30);

            shipments.push({
                shipperName: getRandomItem(shipperNames),
                carrierName: getRandomItem(carrierNames),
                pickupLocation: generateLocation(),
                deliveryLocation: generateLocation(),
                trackingNumber: generateTrackingNumber(),
                status,
                priority: getRandomItem(priorities),
                rate: Math.floor(Math.random() * 5000) + 100,
                weight: Math.floor(Math.random() * 10000) + 10,
                estimatedDelivery: generateDate(-5, 14),
                actualDelivery: status === "DELIVERED" ? generateDate(-7, 0) : undefined,
                flagged: Math.random() > 0.85,
                notes: Math.random() > 0.7 ? "Handle with care - fragile items" : undefined,
                createdBy: Math.random() > 0.5 ? adminUser._id : employeeUser._id,
                createdAt,
                updatedAt: createdAt
            });
        }

        await Shipment.insertMany(shipments);
        console.log(`📦 Created ${shipments.length} shipments`);

        console.log("\n✅ Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1);
    }
}

seed();
