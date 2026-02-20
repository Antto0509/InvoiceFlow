import { z } from 'zod';
import {zDateISO, zUuid} from "@/lib/zod";
import {LOGS_STATUS, LOGS_ACTION_NATURE} from "@/lib/constants";
import {ActivityBuild} from "@/lib/logs";

export type LogsStatus = (typeof LOGS_STATUS)[number];
export type LogsActionNature = (typeof LOGS_ACTION_NATURE)[number];
export type Logs = z.infer<typeof logSchema>;
export type LogsView = Logs & {
        first_name: string;
        last_name: string;
        avatar_url: string;
        company_name: string;
} & ActivityBuild;

export const logSchema = z.object({
        id: zUuid.describe("Identifiant unique du log"),
        user_id: zUuid.describe("Identifiant de l'utilisateur associé au log"),
        company_id: zUuid.nullable().describe("Identifiant de l'entreprise qui emploie l'utilisateur"),
        action_nature: z.enum(LOGS_ACTION_NATURE).describe("Nature de l'action effectuée"),
        log_json: z.string().describe("Log sous format JSON"),
        created_at: zDateISO.describe("Date et heure de création du log"),
        updated_at: zDateISO.describe("Date et heure de la dernière mise à jour du log"),
        status: z.enum(LOGS_STATUS).describe("Statut du log (success ou error)"),
    }
);

export type LogsListParams = {
        page: number;
        pageSize: number;
        search?: string;
        sort: LogsSort;
        signal?: AbortSignal;
        dateFrom?: string; // YYYY-MM-DD
        dateTo?: string;   // YYYY-MM-DD
};

//Utile ?
export type LogsSort = {
        column: keyof LogsView
            // "first_name" | "last_name" | "company_name" | "action_nature" | "created_at" | "status"; //user_name faudra trouver un attribut qui rassemble les deux
        dir: "asc" | "desc";
}

/** Props du composant LogsTable */
export type LogsTableProps = {
        data?: LogsView[];
        loading?: boolean;
        onRowClick?: (id: string) => void;
        sort?: LogsSort;
        onSortChange?: (sort: LogsSort) => void;
};