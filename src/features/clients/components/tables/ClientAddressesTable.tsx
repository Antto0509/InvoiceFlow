"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "@/components/datatable/RowActions";
import { DataTable } from "@/components/datatable/DataTable";
import { ClientAddressesTableProps, ClientAddress, ClientAddressSort } from "@/schemas/clients.schema";
import { SortBtn } from "@/components/datatable/SortBtn";

export function ClientAddressesTable({
    data = [],
    loading,
    onRowClick,
    sort,
    onSortChange,
    onEdit,
    onDelete,
}: ClientAddressesTableProps) {
    const columns = React.useMemo<ColumnDef<ClientAddress>[]>(() => {
        return [
            {
                id: "select",
                header: () => (
                    <input
                        ref={() => {}}
                        type="checkbox"
                        aria-label="Tout sélectionner"
                        checked={false}
                        onChange={() => {}}
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={false}
                        onChange={() => {}}
                        aria-label={`Sélectionner l’adresse ${row.original.line1}`}
                    />
                ),
                size: 40,
            },
            {
                accessorKey: "line1",
                header: () => (
                    <div className="flex items-center gap-1">
                        <span>Adresse</span>
                        <SortBtn col="line1" sort={sort as ClientAddressSort} onSortChange={(s) => onSortChange?.(s as ClientAddressSort)} />
                    </div>
                ),
                cell: ({ row }) => <span>{row.original.line1}</span>,
            },
            {
                accessorKey: "city",
                header: () => (
                    <div className="flex items-center gap-1">
                        <span>Ville</span>
                        <SortBtn col="city" sort={sort as ClientAddressSort} onSortChange={(s) => onSortChange?.(s as ClientAddressSort)} />
                    </div>
                ),
                cell: ({ row }) => <span>{row.original.city}</span>,
            },
            {
                accessorKey: "country",
                header: () => (
                    <div className="flex items-center gap-1">
                        <span>Pays</span>
                        <SortBtn col="country" sort={sort as ClientAddressSort} onSortChange={(s) => onSortChange?.(s as ClientAddressSort)} />
                    </div>
                ),
                cell: ({ row }) => <span>{row.original.country}</span>,
            },
            {
                id: "actions",
                header: () => <span className="sr-only">Actions</span>,
                cell: ({ row }) => (
                    <RowActions
                    item={row.original}
                    onEdit={(item) => onEdit?.(item)}
                    onDelete={(item) => onDelete?.(item)}
                    labels={{ edit: "Éditer", delete: "Supprimer" }}
                    />
                ),
                size: 80,
            },
        ];
    }, [onEdit, onDelete, onSortChange, sort]);

    return (
        <div className="border rounded-xl overflow-hidden">
            <DataTable<ClientAddress>
                columns={columns}
                data={data}
                isLoading={!!loading}
                onRowClick={(row) => onRowClick?.(row.id ?? "")}
            />
        </div>
    );
}