"use client";
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/datatable/DataTable";
import { Badge } from "@/components/ui/badge";
import { RowActions } from "@/components/datatable/RowActions";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { formatMoney, labelDocKind, labelDocStatus, getDocStatusVariant, downloadDocumentPdf } from "@/lib/utils";
import { SortBtn } from "@/components/datatable/SortBtn";
import { FileDown, RefreshCcw } from "lucide-react";
import type { DocumentListRow, DocumentSort, DocumentsTableProps } from "@/schemas/documents.schema";

/** 
 * Table des documents (factures, devis, avoirs, proformas).
 * @param param0 Props du composant
 * @returns Composant DocumentsTable
 */
export function DocumentsTable({
  data = [],
  loading,
  onRowClick,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  showKindColumn = false,
}: DocumentsTableProps) {
  const columns = React.useMemo<ColumnDef<DocumentListRow>[]>(() => {
    const cols: ColumnDef<DocumentListRow>[] = [
      // Type (optionnel)
      ...(showKindColumn
        ? [
            {
              id: "kind",
              header: () => <span>Type</span>,
              cell: ({ row }) => {
                const k = row.original.kind ?? "invoice";
                return <span className="text-muted-foreground">{labelDocKind(k)}</span>;
              },
              size: 120,
            } as ColumnDef<DocumentListRow>,
          ]
        : []),

      {
        accessorKey: "number",
        header: () => (
          <div className="flex items-center gap-1">
            <span>N°</span>
            <SortBtn col="number" sort={sort as DocumentSort} onSortChange={(s) => onSortChange?.(s as DocumentSort)} />
          </div>
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.number ?? "–"}</span>,
        size: 140,
      },
      {
        accessorKey: "client_name",
        header: () => (
          <div className="flex items-center gap-1">
            <span>Client</span>
            <SortBtn col="client_name" sort={sort as DocumentSort} onSortChange={(s) => onSortChange?.(s as DocumentSort)} />
          </div>
        ),
        cell: ({ row }) => <span>{row.original.client_name ?? "–"}</span>,
      },
      {
        accessorKey: "issue_date",
        header: () => (
          <div className="flex items-center gap-1">
            <span>Émission</span>
            <SortBtn col="issue_date" sort={sort as DocumentSort} onSortChange={(s) => onSortChange?.(s as DocumentSort)} />
          </div>
        ),
        cell: ({ row }) => <span>{new Date(row.original.issue_date).toLocaleDateString()}</span>,
        size: 140,
      },
      {
        accessorKey: "total",
        header: () => (
          <div className="ml-auto flex items-center gap-1 justify-end">
            <span>Montant</span>
            <SortBtn col="total" sort={sort as DocumentSort} onSortChange={(s) => onSortChange?.(s as DocumentSort)} />
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
            <SortBtn col="status" sort={sort as DocumentSort} onSortChange={(s) => onSortChange?.(s as DocumentSort)} />
          </div>
        ),
        cell: ({ row }) => {
          const k = row.original.kind ?? "invoice";
          const s = row.original.status;
          const label = labelDocStatus(k, s);
          const variant = getDocStatusVariant(s);
          return <Badge variant={variant}>{label}</Badge>;
        },
        size: 140,
      },
      {
        id: "actions",
        header: () => <span />,
        cell: ({ row }) => {
          const doc = row.original;
          const isPdfCapable = doc.kind === "invoice" || doc.kind === "credit_note" || doc.kind === "proforma";
          return (
            <RowActions
              item={doc}
              onEdit={(item) => onEdit?.(item)}
              onDelete={(item) => onDelete?.(item)}
              labels={{ edit: "Éditer", delete: "Supprimer" }}
              actions={
                isPdfCapable
                  ? [
                      {
                        label: "Télécharger PDF",
                        icon: <FileDown className="h-4 w-4" />,
                        onClick: async () => {
                          await downloadDocumentPdf(doc.id, false);
                        },
                        variant: "secondary",
                        separatorBefore: true,
                      },
                      {
                        label: "Régénérer PDF",
                        icon: <RefreshCcw className="h-4 w-4" />,
                        onClick: async () => {
                          await downloadDocumentPdf(doc.id, true);
                        },
                        variant: "ghost",
                      },
                    ]
                  : []
              }
            />
          );
        },
        size: 160,
      },
    ];

    return cols;
  }, [sort, onSortChange, onEdit, onDelete, showKindColumn]);

  return (
    <div className="border rounded-xl overflow-hidden">
      <DataTable<DocumentListRow>
        columns={columns}
        data={data}
        isLoading={!!loading}
        onRowClick={(row) => onRowClick?.(row.id)}
      />
    </div>
  );
}
