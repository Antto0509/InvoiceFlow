"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/datatable/DataTable";
import { LogsTableProps, LogsView, LogsSort } from "@/features/activityLogs/schemas/logs.schema";
import { getLogMessage } from "@/lib/logs";

export function LogsTable({
    data = [],
    loading,
    onRowClick,
}: LogsTableProps) {
    const columns: ColumnDef<LogsView>[] = React.useMemo(() => [
        {
            id: "message",
            header: "Activité",
            cell: ({ row }) => (
                <span className="font-medium">
                    {getLogMessage(row.original)}
                </span>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <span className="font-medium">
                    {row.original.created_at ? new Date(row.original.created_at).toLocaleString("fr-FR", {  //Formatage de la colonne pour le format JJ/MM/AAAA HH:MM
                        dateStyle: "short",
                        timeStyle: "short"
                    }) : "—"}
                </span>
            )
        },
    ], []);


    return (
        <div className="border rounded-xl overflow-hidden">
            <DataTable<LogsView>
                columns={columns}
                data={data}
                isLoading={!!loading}
                onRowClick={(row) => onRowClick?.(row.id ?? "")}
            />
        </div>
    );
}
