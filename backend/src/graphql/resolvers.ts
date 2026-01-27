import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { Shipment, User, IShipment, IUser } from "../models";
import { Context } from "../types";

// Helper to safely format dates to ISO string
const toISO = (date: any): string | null => {
    if (!date) return null;
    try {
        const d = new Date(date);
        // If valid date, return ISO string
        if (!isNaN(d.getTime())) return d.toISOString();

        // Handle stringified timestamp (e.g. "1769...")
        if (typeof date === 'string' && /^\d+$/.test(date)) {
            const numDate = new Date(parseInt(date, 10));
            if (!isNaN(numDate.getTime())) return numDate.toISOString();
        }
    } catch (e) {
        console.error("Date serialization error:", e);
    }
    return null;
};

// Helper: Serialize Shipment
const serializeShipment = (shipment: any) => ({
    ...shipment,
    id: shipment._id ? shipment._id.toString() : shipment.id,
    estimatedDelivery: toISO(shipment.estimatedDelivery),
    actualDelivery: toISO(shipment.actualDelivery),
    createdAt: toISO(shipment.createdAt),
    updatedAt: toISO(shipment.updatedAt),
    createdBy: typeof shipment.createdBy === 'object' && shipment.createdBy !== null
        ? { ...shipment.createdBy, id: shipment.createdBy._id?.toString() }
        : shipment.createdBy
});

// Helper: Serialize User
const serializeUser = (user: any) => ({
    ...user,
    id: user._id ? user._id.toString() : user.id,
    lastLogin: toISO(user.lastLogin),
    createdAt: toISO(user.createdAt),
    updatedAt: toISO(user.updatedAt)
});

// Helper to generate tracking number
function generateTrackingNumber(): string {
    const prefix = "TMS";
    const randomNum = Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, "0");
    return `${prefix}${randomNum}`;
}

// Helper to generate JWT token
function generateToken(user: IUser): string {
    const secret = process.env.JWT_SECRET || "secret";
    const expiresInSeconds = 7 * 24 * 60 * 60; // 7 days in seconds

    return jwt.sign(
        { userId: user.id, role: user.role },
        secret,
        { expiresIn: expiresInSeconds }
    );
}

// Helper to check authorization
function checkAuth(context: Context, requiredRole?: string) {
    if (!context.user) {
        throw new GraphQLError("Authentication required", {
            extensions: { code: "UNAUTHENTICATED" }
        });
    }

    if (requiredRole && context.user.role !== requiredRole) {
        throw new GraphQLError("Not authorized to perform this action", {
            extensions: { code: "FORBIDDEN" }
        });
    }

    return context.user;
}

export const resolvers = {
    Query: {
        // Get paginated shipments with optional filtering and sorting
        shipments: async (
            _: any,
            {
                filter,
                page = 1,
                limit = 10,
                sortBy = "createdAt",
                sortOrder = "DESC"
            }: {
                filter?: any;
                page?: number;
                limit?: number;
                sortBy?: string;
                sortOrder?: "ASC" | "DESC";
            }
        ) => {
            const query: any = {};

            // Apply filters
            if (filter) {
                if (filter.status) query.status = filter.status;
                if (filter.priority) query.priority = filter.priority;
                if (filter.carrierName) {
                    query.carrierName = { $regex: filter.carrierName, $options: "i" };
                }
                if (filter.shipperName) {
                    query.shipperName = { $regex: filter.shipperName, $options: "i" };
                }
                if (filter.flagged !== undefined) query.flagged = filter.flagged;
                if (filter.search) {
                    query.$or = [
                        { trackingNumber: { $regex: filter.search, $options: "i" } },
                        { shipperName: { $regex: filter.search, $options: "i" } },
                        { carrierName: { $regex: filter.search, $options: "i" } }
                    ];
                }
                if (filter.dateFrom || filter.dateTo) {
                    query.estimatedDelivery = {};
                    if (filter.dateFrom) {
                        query.estimatedDelivery.$gte = new Date(filter.dateFrom);
                    }
                    if (filter.dateTo) {
                        query.estimatedDelivery.$lte = new Date(filter.dateTo);
                    }
                }
            }

            // Calculate pagination
            const skip = (page - 1) * limit;
            const sort: any = { [sortBy]: sortOrder === "ASC" ? 1 : -1 };

            // Execute queries
            const [shipments, total] = await Promise.all([
                Shipment.find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .populate("createdBy")
                    .lean(),
                Shipment.countDocuments(query)
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                shipments: shipments.map((s: any) => serializeShipment(s)),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            };
        },

        // Get single shipment by ID
        shipment: async (_: any, { id }: { id: string }) => {
            const shipment = await Shipment.findById(id).populate("createdBy").lean();
            if (!shipment) {
                throw new GraphQLError("Shipment not found", {
                    extensions: { code: "NOT_FOUND" }
                });
            }
            return serializeShipment(shipment);
        },

        // Get dashboard statistics
        shipmentStats: async () => {
            const [stats] = await Shipment.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        pending: {
                            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] }
                        },
                        inTransit: {
                            $sum: { $cond: [{ $eq: ["$status", "IN_TRANSIT"] }, 1, 0] }
                        },
                        delivered: {
                            $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0] }
                        },
                        cancelled: {
                            $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] }
                        },
                        flagged: {
                            $sum: { $cond: ["$flagged", 1, 0] }
                        },
                        totalRevenue: { $sum: "$rate" }
                    }
                }
            ]);

            return (
                stats || {
                    total: 0,
                    pending: 0,
                    inTransit: 0,
                    delivered: 0,
                    cancelled: 0,
                    flagged: 0,
                    totalRevenue: 0
                }
            );
        },

        // Get current user
        me: async (_: any, __: any, context: Context) => {
            if (!context.user) return null;
            const user = await User.findById(context.user.userId).lean();
            return user ? serializeUser(user) : null;
        },

        // Get all users (admin only)
        users: async (_: any, __: any, context: Context) => {
            checkAuth(context, "admin");
            const users = await User.find().lean();
            return users.map((u: any) => serializeUser(u));
        },
    },

    Mutation: {
        // User registration
        register: async (_: any, { input }: { input: any }) => {
            const existingUser = await User.findOne({ email: input.email });
            if (existingUser) {
                throw new GraphQLError("Email already in use", {
                    extensions: { code: "BAD_USER_INPUT" }
                });
            }

            const user = new User(input);
            await user.save();

            const token = generateToken(user);
            const userObj = user.toObject();

            return {
                token,
                user: serializeUser(userObj)
            };
        },

        // User login
        login: async (_: any, { input }: { input: any }) => {
            const user = await User.findOne({ email: input.email }).select(
                "+password"
            );
            if (!user) {
                throw new GraphQLError("Invalid credentials", {
                    extensions: { code: "UNAUTHENTICATED" }
                });
            }

            const isValid = await user.comparePassword(input.password);
            if (!isValid) {
                throw new GraphQLError("Invalid credentials", {
                    extensions: { code: "UNAUTHENTICATED" }
                });
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            const token = generateToken(user);
            const userObj = user.toObject();

            return {
                token,
                user: { ...serializeUser(userObj), password: undefined }
            };
        },

        // Create shipment
        createShipment: async (
            _: any,
            { input }: { input: any },
            context: Context
        ) => {
            const user = checkAuth(context);

            const shipment = new Shipment({
                ...input,
                trackingNumber: generateTrackingNumber(),
                status: "PENDING",
                flagged: false,
                createdBy: user.userId
            });

            await shipment.save();

            return serializeShipment(shipment.toObject());
        },

        // Update shipment
        updateShipment: async (
            _: any,
            { id, input }: { id: string; input: any },
            context: Context
        ) => {
            checkAuth(context);

            const shipment = await Shipment.findByIdAndUpdate(
                id,
                { $set: input },
                { new: true, runValidators: true }
            ).populate("createdBy");

            if (!shipment) {
                throw new GraphQLError("Shipment not found", {
                    extensions: { code: "NOT_FOUND" }
                });
            }

            return serializeShipment(shipment.toObject());
        },

        // Delete shipment (admin only)
        deleteShipment: async (
            _: any,
            { id }: { id: string },
            context: Context
        ) => {
            checkAuth(context, "admin");

            const result = await Shipment.findByIdAndDelete(id);
            if (!result) {
                throw new GraphQLError("Shipment not found", {
                    extensions: { code: "NOT_FOUND" }
                });
            }

            return true;
        },

        // Flag/unflag shipment
        flagShipment: async (
            _: any,
            { id, flagged }: { id: string; flagged: boolean },
            context: Context
        ) => {
            checkAuth(context);

            const shipment = await Shipment.findByIdAndUpdate(
                id,
                { $set: { flagged } },
                { new: true }
            ).populate("createdBy");

            if (!shipment) {
                throw new GraphQLError("Shipment not found", {
                    extensions: { code: "NOT_FOUND" }
                });
            }

            return serializeShipment(shipment.toObject());
        }
    },

    // Field resolvers
    Shipment: {
        createdBy: async (parent: any) => {
            if (parent.createdBy && typeof parent.createdBy === "object") {
                return serializeUser({ ...parent.createdBy, id: parent.createdBy._id?.toString() });
            }
            if (!parent.createdBy) return null;
            const user = await User.findById(parent.createdBy).lean();
            return user ? serializeUser(user) : null;
        }
    }
};
