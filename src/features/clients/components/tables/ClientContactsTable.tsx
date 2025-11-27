"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "@/components/datatable/RowActions";
import { DataTable } from "@/components/datatable/DataTable";
import { ClientContactsTableProps, ClientContact, ClientContactSort } from "@/schemas/clients.schema";
import { SortBtn } from "@/components/datatable/SortBtn";

export function ClientContactsTable({
    data = [],
    loading,
    onRowClick,
    sort,
    onSortChange,
    onEdit,
    onDelete,
}: ClientContactsTableProps) {
    const columns = React.useMemo<ColumnDef<ClientContact>[]>(() => {
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
                        aria-label={`Sélectionner le contact ${row.original.full_name}`}
                    />
                ),
                size: 40,
            },
            {
                accessorKey: "full_name",
                header: () => (
                    <div className="flex items-center gap-1">
                        <span>Nom complet</span>
                        <SortBtn col="full_name" sort={sort as ClientContactSort} onSortChange={(s) => onSortChange?.(s as ClientContactSort)} />
                    </div>
                ),
                cell: ({ row }) => <span className="font-medium">{row.original.full_name}</span>,
            },
            {
                accessorKey: "email",
                header: () => (
                    <div className="flex items-center gap-1">
                        <span>Email</span>
                        <SortBtn col="email" sort={sort as ClientContactSort} onSortChange={(s) => onSortChange?.(s as ClientContactSort)} />
                    </div>
                ),
                cell: ({ row }) => {
                    const email = row.original.email;

                    if (!email) {
                        return <span className="hidden md:inline">—</span>;
                    }

                    return (
                        <a
                            href={`mailto:${email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hidden md:inline text-primary hover:underline"
                        >
                            {email}
                        </a>
                    );
                },
            },
            {
                accessorKey: "phone",
                header: () => (
                    <div className="flex items-center gap-1">
                        <span>Téléphone</span>
                        <SortBtn col="phone" sort={sort as ClientContactSort} onSortChange={(s) => onSortChange?.(s as ClientContactSort)} />
                    </div>
                ),
                cell: ({ row }) => {
                    const phone = row.original.phone;

                    if (!phone) {
                        return <span className="hidden md:inline">—</span>;
                    }

                    return (
                        <a
                            href={`tel:${phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hidden md:inline text-primary hover:underline"
                        >
                            {phone}
                        </a>
                    );
                },
            },
            {
                accessorKey: "role",
                header: () => (
                    <div className="flex items-center gap-1">
                        <span>Rôle</span>
                        <SortBtn col="role" sort={sort as ClientContactSort} onSortChange={(s) => onSortChange?.(s as ClientContactSort)} />
                    </div>
                ),
                cell: ({ row }) => <span className="font-medium">{row.original.role}</span>,
            },
            {
                id: "actions",
                header: () => <span className="sr-only">Actions</span>,
                cell: ({ row }) => (
                    <RowActions
                        item={row.original}
                        onEdit={(item) => onEdit?.(item)}
                        onDelete={(item) => onDelete?.(item)}
                    />
                ),
                size: 40,
            },
        ];
    }, [onEdit, onDelete, onSortChange, sort]);

    return (
        <div className="border rounded-xl overflow-hidden">
            <DataTable<ClientContact>
                columns={columns}
                data={data}
                isLoading={!!loading}
                onRowClick={(row) => onRowClick?.(row.id ?? "")}
            />
        </div>
    );
}