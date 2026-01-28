import { ResourceApi } from "../ResourceApi";
import type { User } from "@/schemas/users.schema";

/**
 * API pour les utilisateurs
 */
export class UsersApi extends ResourceApi<User> {
    constructor() {
        super({
            table: "users",
            select: "*",
            sortableColumns: ["created_at", "email", "first_name", "last_name"],
            searchColumns: ["email", "first_name", "last_name"],
        });
    }
}