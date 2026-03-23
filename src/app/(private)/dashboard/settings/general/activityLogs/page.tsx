"use client";

import * as React from "react";
import { ListPage } from "@/components/ListPage";
import { DataToolbar } from "@/components/datatable/DataToolbar";
import { Pagination } from "@/components/datatable/Pagination";
import { useDataTable } from "@/hooks/useDataTable";
import { ExportMenu } from "@/components/datatable/toolbar/ExportMenu";

import type { LogsView, LogsListParams, LogsSort } from "@/features/activityLogs/schemas/logs.schema";
import { LogsTable } from "@/features/activityLogs/components/LogsTable";
import { listLogs } from "@/features/activityLogs/data/logs.repository";

export default function LogsPage() {
    const { data, total, loading, params, setParams } = useDataTable<LogsView, LogsListParams>(
        async (p) => {
            const res = await listLogs({
                page: p.page,
                pageSize: p.pageSize,
                search: p.search,
                sort: p.sort,
            });
            return { rows: res.rows, total: res.total };
        },
        {
            page: 1,
            pageSize: 20,
            search: "",
            sort: { column: "company_id", dir: "asc" }, //Voir pour faire sur le nom plutôt que l'id company
        }
    );

    return (
        <ListPage
            title="Journal d'activité"
            description="Toutes les activités effectués sur votre compte ou dans votre entreprise : création/modification/suppression de clients, documents..."
            toolbar={
                <DataToolbar
                    placeholder="Rechercher un log (nom, action, date...)."
                    search={params.search ?? ""}
                    onSearch={(v) => setParams({ ...params, page: 1, search: v })}
                    right={
                        <>
                            <ExportMenu onExportAll={() => { }} onExportPage={() => { }} />
                        </>
                    }
                />
            }
        >

            <LogsTable
                data={data}
                loading={loading}
                sort={params.sort}
                onSortChange={(sort: LogsSort) => setParams({ ...params, sort })}
            />

            <Pagination
                total={total}
                page={params.page ?? 1}
                pageSize={params.pageSize ?? 20}
                onPageChange={(page) => setParams({ ...params, page })}
            />

        </ListPage>
    );
}
