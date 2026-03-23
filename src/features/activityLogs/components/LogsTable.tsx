"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/datatable/DataTable";
import { LogsTableProps, LogsView } from "@/features/activityLogs/schemas/logs.schema";
import { getLogMessage } from "@/lib/logs";
import { formatDateTime } from "@/lib/utils";

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
                    {formatDateTime(row.original.created_at)}
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
