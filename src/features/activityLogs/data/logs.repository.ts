import { LogsView, LogsListParams, LogsSort } from "@/features/activityLogs/schemas/logs.schema";
import { createResourceApi } from "@/data/createResourceApi";

export const makeLogsApi = (userId?: string, companyId?: string) =>
    createResourceApi<LogsView>({
        table: "logs_with_user_company", //Vue SQL Supabase
        select:
            "id, user_id, first_name, last_name, avatar_url, company_id, company_name, action_nature, log_json, created_at, updated_at, status",
        sortableColumns: [
            "first_name",
            "last_name",
            "action_nature",
            "created_at",
            "status",
        ],
        searchColumns: ["first_name", "last_name", "created_at"],
        defaultFilters: userId
            ? { user_id: { op: "eq", value: userId } }
            : undefined,
    });

export async function listLogs(
    params: Partial<LogsListParams> = {},
    userId?: string,
    companyId?: string
) {
    const {
        page = 1,
        pageSize = 20,
        search,
        sort = { column: "created_at", dir: "asc" as const } as LogsSort,
        signal,
        dateFrom,
        dateTo,
    } = params as LogsListParams;

    const api = makeLogsApi(userId, companyId);

    try {
        const { data, total } = await api.list({
            page,
            pageSize,
            search,
            sort,
            signal,
            filters: {
                ...(dateFrom ? { created_at: { op: "gte", value: dateFrom } } : {}),
                ...(dateTo ? { created_at: { op: "lte", value: dateTo } } : {}),
            },
        });

        const rows = (data ?? []).map((l: LogsView & { user_name?: { first_name: string, last_name: string } }) => ({
            ...l,
            user_name: l.user_name ? `${l.user_name.first_name} ${l.user_name.last_name}` : undefined,
        }));

        return { rows, total };
    } catch (err) {
        console.error(
            "[logsApi:listLogs] Failed",
            { params, userId },
            err
        );
        throw err;
    }
}