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
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "secret"
            ) as TokenPayload;

            (req as any).user = decoded;
        } catch (error) {
            // Token is invalid, but we don't throw an error
            // Let the resolver handle unauthorized access
            console.log("Invalid token:", error);
        }
    }

    next();
}
