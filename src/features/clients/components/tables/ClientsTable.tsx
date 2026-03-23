"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "@/components/datatable/RowActions";
import { DataTable } from "@/components/datatable/DataTable";
import { ClientsTableProps, ClientListRow, ClientSort } from "@/schemas/clients.schema";
import { SortBtn } from "@/components/datatable/SortBtn";
import { formatDate } from "@/lib/utils";

export function ClientsTable({
  data = [],
  loading,
  onRowClick,
  sort,
  onSortChange,
  onEdit,
  onDelete,
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
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            <span>Téléphone</span>
            <SortBtn col="phone" sort={sort as ClientSort} onSortChange={(s) => onSortChange?.(s as ClientSort)} />
          </div>
        ),
        cell: ({ row }) => {
          const phone = row.original.phone;

          if (!phone) {
            return <span className="hidden lg:inline">—</span>;
          }

          return (
            <a
              href={`tel:${phone}`}
              onClick={(e) => e.stopPropagation()}
              className="hidden lg:inline text-primary hover:underline"
            >
              {phone}
            </a>
          );
        }
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
            {formatDate(row.original.created_at)}
          </span>
        ),
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
  }, [sort, onSortChange, onEdit, onDelete]);

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
