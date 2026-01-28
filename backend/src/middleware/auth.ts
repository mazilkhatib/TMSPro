import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface TokenPayload {
    userId: string;
    role: "admin" | "employee";
}

export async function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.replace("Bearer ", "");

        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                console.error("JWT_SECRET environment variable is not set");
                return next();
            }
            const decoded = jwt.verify(token, secret) as TokenPayload;

            (req as any).user = decoded;
        } catch (error) {
            // Token is invalid, but we don't throw an error
            // Let the resolver handle unauthorized access
            console.log("Invalid token:", error);
        }
    }

    next();
}
