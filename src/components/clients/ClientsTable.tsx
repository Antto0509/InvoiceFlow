"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "../entity/table/RowActions";
import { DataTable } from "@/components/shared/DataTable";
import { ClientsTableProps, ClientListRow, ClientSort } from "@/schemas/clients";
import { SortBtn } from "../shared/SortBtn";

export function ClientsTable({
  data = [],
  loading,
  onRowClick,
  sort,
  onSortChange,
}: ClientsTableProps) {
  const columns = React.useMemo<ColumnDef<ClientListRow>[]>(() => {
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
            aria-label={`Sélectionner ${row.original.name}`}
          />
        ),
        size: 40,
      },
      {
        accessorKey: "name",
        header: () => (
          <div className="flex items-center gap-1">
            <span>Nom</span>
            <SortBtn col="name" sort={sort as ClientSort} onSortChange={(s) => onSortChange?.(s as ClientSort)} />
          </div>
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "email",
        header: () => (
          <div className="hidden md:flex md:items-center md:gap-1">
            <span>Email</span>
            <SortBtn col="email" sort={sort as ClientSort} onSortChange={(s) => onSortChange?.(s as ClientSort)} />
          </div>
        ),
        cell: ({ row }) => <span className="hidden md:inline">{row.original.email ?? "—"}</span>,
      },
      {
        accessorKey: "company",
        header: () => (
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            <span>Société</span>
            <SortBtn col="company" sort={sort as ClientSort} onSortChange={(s) => onSortChange?.(s as ClientSort)} />
          </div>
        ),
        cell: ({ row }) => <span className="hidden lg:inline">{row.original.company ?? "—"}</span>,
      },
      {
        accessorKey: "created_at",
        header: () => (
          <div className="hidden xl:flex xl:items-center xl:gap-1">
            <span>Créé le</span>
            <SortBtn col="created_at" sort={sort as ClientSort} onSortChange={(s) => onSortChange?.(s as ClientSort)} />
          </div>
        ),
        cell: ({ row }) => (
          <span className="hidden xl:inline">
            {row.original.created_at
              ? new Date(row.original.created_at).toLocaleDateString()
              : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <RowActions
            item={row.original}
            onEdit={() => {}}
            onDelete={() => {}}
            labels={{ edit: "Éditer", delete: "Supprimer" }}
          />
        ),
        size: 80,
      },
    ];
  }, [sort, onSortChange]);

  return (
    <div className="border rounded-xl overflow-hidden">
      <DataTable<ClientListRow>
        columns={columns}
        data={data}
        isLoading={!!loading}
        onRowClick={(row) => onRowClick?.(row.id)}
      />
    </div>
  );
}
