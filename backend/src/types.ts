import { Request } from "express";
import { TokenPayload } from "./middleware/auth";

export interface Context {
    req: Request;
    user: TokenPayload | null;
}
