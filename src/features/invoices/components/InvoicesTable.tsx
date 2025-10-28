"use client";
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/datatable/DataTable";
import { Badge } from "@/components/ui/badge";
import { RowActions } from "@/components/datatable/RowActions";
import type { InvoiceListRow, InvoiceSort, InvoicesTableProps } from "@/schemas/invoices.schema";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import { SortBtn } from "@/components/datatable/SortBtn";

export function InvoicesTable({
  data = [],
  loading,
  onRowClick,
  sort,
  onSortChange,
  onEdit,
  onDelete,
}: InvoicesTableProps) {
  const columns = React.useMemo<ColumnDef<InvoiceListRow>[]>(() => {
    return [
      {
        accessorKey: "number",
        header: () => (
          <div className="flex items-center gap-1">
            <span>N°</span>
            <SortBtn col="number" sort={sort as InvoiceSort} onSortChange={(s) => onSortChange?.(s as InvoiceSort)} />
          </div>
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.number ?? "–"}</span>,
        size: 120,
      },
      {
        accessorKey: "client_name",
        header: () => (
          <div className="flex items-center gap-1">
            <span>Client</span>
            <SortBtn col="client_name" sort={sort as InvoiceSort} onSortChange={(s) => onSortChange?.(s as InvoiceSort)} />
          </div>
        ),
        cell: ({ row }) => (
          <span>{row.original.client_name ?? "–"}</span>
        ),
      },
      {
        accessorKey: "issue_date",
        header: () => (
          <div className="flex items-center gap-1">
            <span>Emission</span>
            <SortBtn col="issue_date" sort={sort as InvoiceSort} onSortChange={(s) => onSortChange?.(s as InvoiceSort)} />
          </div>
        ),
        cell: ({ row }) => (
          <span>{new Date(row.original.issue_date).toLocaleDateString()}</span>
        ),
      },
      {
        accessorKey: "total",
        header: () => (
          <div className="ml-auto flex items-center gap-1 justify-end">
            <span>Montant</span>
            <SortBtn col="total" sort={sort as InvoiceSort} onSortChange={(s) => onSortChange?.(s as InvoiceSort)} />
          </div>
        ),
        cell: ({ row }) => (
          <span className="ml-auto block text-right">
            {formatMoney(row.original.total ?? 0, row.original.currency_code ?? DEFAULT_CURRENCY)}
          </span>
        ),
        meta: { className: "text-right" },
      },
      {
        accessorKey: "status",
        header: () => (
          <div className="flex items-center gap-1">
            <span>Statut</span>
            <SortBtn
              col="status"
              sort={sort as InvoiceSort}
              onSortChange={(s) => onSortChange?.(s as InvoiceSort)}
            />
          </div>
        ),
        cell: ({ row }) => {
          const status = row.original.status;

          const labelMap: Record<string, string> = {
            draft: "Brouillon",
            sent: "Envoyée",
            paid: "Payée",
            overdue: "En retard",
          };

          const variantMap: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
            paid: "default",
            overdue: "destructive",
            draft: "secondary",
            sent: "outline",
          };

          const label = labelMap[status] ?? "–";
          const variant = variantMap[status] ?? "secondary";

          return <Badge variant={variant}>{label}</Badge>;
        },
        size: 120,
      },
      {
        id: "actions",
        header: () => <span />,
        cell: ({ row }) => (
          <RowActions
            item={row.original}
            onEdit={(item) => onEdit?.(item)}
            onDelete={(item) => onDelete?.(item)}
            labels={{ edit: "Éditer", delete: "Supprimer" }}
          />
        ),
        size: 60,
      },
    ];
  }, [sort, onSortChange, onEdit, onDelete]);

  return (
    <div className="border rounded-xl overflow-hidden">
      <DataTable<InvoiceListRow>
        columns={columns}
        data={data}
        isLoading={!!loading}
        onRowClick={(row) => onRowClick?.(row.id)}
      />
    </div>
  );
}
