import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import mongoose from "mongoose";
import { typeDefs, resolvers } from "./graphql";
import { authMiddleware } from "./middleware";
import { Context } from "./types";

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tms";

async function startServer() {
    const app = express();

    // Connect to MongoDB
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }

    // Create Apollo Server
    const server = new ApolloServer<Context>({
        typeDefs,
        resolvers,
        introspection: true,
        formatError: (formattedError, error) => {
            console.error("GraphQL Error:", error);
            return formattedError;
        }
    });

    await server.start();
    console.log("✅ Apollo Server started");

    // Middleware
    app.use(
        cors({
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true
        })
    );
    app.use(express.json());
    app.use(authMiddleware);

    // GraphQL endpoint
    app.use(
        "/graphql",
        expressMiddleware(server, {
            context: async ({ req }) => ({
                req,
                user: (req as any).user || null
            })
        })
    );

    // Health check endpoint
    app.get("/health", (_, res) => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // Start server
    app.listen(PORT, () => {
        console.log(`
🚀 TMS GraphQL Server is running!
   
   GraphQL Playground: http://localhost:${PORT}/graphql
   Health Check:       http://localhost:${PORT}/health
    `);
    });
}

startServer().catch(console.error);
