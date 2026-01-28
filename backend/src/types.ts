import { Request } from "express";
import { TokenPayload } from "./middleware/auth";
import { UserLoader } from "./utils/dataloader";

export interface Context {
    req: Request;
    user: TokenPayload | null;
    userLoader: UserLoader;
}
