import { ResourceApi } from "../ResourceApi";
import type { Settings } from "@/schemas/settings.schema";

/**
 * API pour les paramètres utilisateur
 */
export class SettingsApi extends ResourceApi<Settings> {
    constructor() {
        super({
            table: "settings",
            select: "*",
            sortableColumns: ["updated_at", "user_id"],
            searchColumns: [],
        });
    }
}