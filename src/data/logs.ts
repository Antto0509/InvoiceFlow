import { createClient } from "@/data/supabase/client";
import { LogsStatus, LogsActionNature } from "@/features/activityLogs/schemas/logs.schema";

/** Fonction utilitaire */
export async function logAction(params: {
    companyID: Promise<string | undefined>;
    action: LogsActionNature;
    payload?: Partial<Record<string, unknown>>;
    logError?: unknown;
    status: LogsStatus;
}) {
    try {
        const supabase = createClient();

        const companyID = await params.companyID;

        const { data, error } = await supabase.from("logs").insert({
            company_id: companyID,
            action_nature: params.action,
            log_json: params.payload,
            status: params.status,
            error: params.logError,
        }).select().single();

        if (error) {
            console.log("const logError :", error);
            throw error;
        }
    } catch {
        //IMPORTANT : le logging ne doit JAMAIS faire planter l'app
    }
}

export async function viewCompanyID(params: {
    table?: string;
    objectID?: string;
}): Promise<string | undefined> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from("v_company_lookup")
            .select("company_id")
            .eq('source_table', params.table)
            .eq('source_id', params.objectID)
            .maybeSingle();

        if (error) {
            console.log("viewCompanyID error :", error);
            return undefined;
        }

        return data.company_id || undefined;
    } catch { }
}