import { createClient } from "@/data/supabase/client";
import {LogsStatus, LogsActionNature} from "@/features/logs/schemas/logs.schema";

/** Fonction utilitaire */
export async function logAction(params: {
    companyID: string | undefined; //Voir pour le trouver grâce à la table 'clients'
    action: LogsActionNature;
    payload?: Partial<Record<string, unknown>>;
    logError?: unknown;
    status: LogsStatus;
}) {
    try {
        const supabase = createClient();

        const {data, error} = await supabase.from("logs").insert({
            company_id: params.companyID,
            action_nature: params.action,
            log_json: params.payload,
            status: params.status,
            error: params.logError,
        }).select().single();

        if (error) {
            console.log("const logError :", error);
            throw error;
        }
        console.log("const logData :", data);
    } catch {
        //IMPORTANT : le logging ne doit JAMAIS faire planter l'app
    }
}