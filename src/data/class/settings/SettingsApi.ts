import { ResourceApi } from "../ResourceApi";
import type { Settings } from "@/schemas/settings.schema";

/**
 * API pour les paramètres utilisateur
 */
export class SettingsApi extends ResourceApi<Settings> {
    constructor() {
        super({
            table: "settings",
            select: "user_id, logo_url, legal_notes, bank_info, tax_rate, updated_at",
            sortableColumns: ["updated_at", "user_id"],
            searchColumns: [],
        });
    }
}