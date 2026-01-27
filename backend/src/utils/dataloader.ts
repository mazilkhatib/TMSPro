import DataLoader from "dataloader";
import { User, IUser } from "../models";

// Create a DataLoader for batching user queries
export function createUserLoader() {
    return new DataLoader<string, IUser | null>(async (userIds) => {
        const users = await User.find({ _id: { $in: userIds } }).lean();

        // Create a map for O(1) lookup
        const userMap = new Map<string, IUser>();
        users.forEach((user: any) => {
            userMap.set(user._id.toString(), user);
        });

        // Return users in the same order as the input IDs
        return userIds.map((id) => userMap.get(id) || null);
    });
}

export type UserLoader = ReturnType<typeof createUserLoader>;
