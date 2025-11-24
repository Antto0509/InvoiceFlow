"use client";
import * as React from "react";
import { ListPage } from "@/components/ListPage";
import { DataToolbar } from "@/components/datatable/DataToolbar";
import { Pagination } from "@/components/datatable/Pagination";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { useDataTable } from "@/hooks/useDataTable";
import { ExportMenu } from "@/components/datatable/toolbar/ExportMenu";

import { DocumentsTable } from "@/features/invoices";
import { listDocuments, getDocumentDetail } from "@/features/invoices";
import type { Document, EditDoc, DocumentListRow, DocumentListParams, DocumentStatus } from "@/features/invoices";

import { InvoicesFilters } from "@/features/invoices";
import { InvoiceDialogs } from "@/features/invoices";

export default function InvoicesPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [editInvoice, setEditInvoice] = React.useState<EditDoc | null>(null);
  const [updating, setUpdating] = React.useState(false);
  const [deleteInvoice, setDeleteInvoice] = React.useState<Document | null>(null);

  const { data, total, loading, params, setParams } = useDataTable<DocumentListRow, DocumentListParams>(
    async (p) => {
      const res = await listDocuments({
        page: p.page,
        pageSize: p.pageSize,
        search: p.search,
        status: p.status,
        sort: p.sort,
        kind: "invoice",
      });
      return { rows: res.rows, total: res.total };
    },
    {
      page: 1,
      pageSize: 20,
      search: "",
      status: "all",
      sort: { column: "issue_date", dir: "desc" },
      kind: "invoice",
    }
  );

  // Handlers pour la table
  const handleEdit = async (row: DocumentListRow) => {
    try {
      setUpdating(true);
      const full = await getDocumentDetail(row.id);
      setEditInvoice(full as EditDoc);
    } catch (e) {
      toast.error("Impossible de charger la facture");
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (row: DocumentListRow) => {
    setDeleteInvoice({ id: row.id } as Document);
  };

  return (
    <ListPage
      title="Factures"
      description="Gère tes factures : ajouter, éditer, supprimer."
      actions={
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Nouvelle facture
        </Button>
      }
      toolbar={
        <DataToolbar
          placeholder="Rechercher une facture (n° ou client)."
          search={params.search ?? ""}
          onSearch={(v) => setParams({ ...params, page: 1, search: v })}
          left={
            <InvoicesFilters
              status={(params.status as DocumentStatus) ?? "all"}
              onStatusChange={(status) => setParams({ ...params, page: 1, status })}
            />
          }
          right={
            <>
              <Button size="sm" variant="secondary" onClick={() => {}}>
                <Upload className="h-4 w-4 mr-1" />
                Importer
              </Button>
              <ExportMenu onExportAll={() => {}} onExportPage={() => {}} />
            </>
          }
        />
      }
    >
      <DocumentsTable
        data={data}
        loading={loading}
        sort={params.sort}
        onSortChange={(s) => setParams({ ...params, sort: s })}
        onRowClick={(id) => {
          toast.info(`Cliqué sur la facture avec l'ID : ${id}`);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showKindColumn={false} // ici on n'affiche que des factures
      />

      <Pagination
        page={params.page ?? 1}
        pageSize={params.pageSize ?? 20}
        total={total}
        onPageChange={(p) => setParams({ ...params, page: p })}
      />

      {/* Modales (tes dialogs "invoice" sont déjà migrés vers documents en interne) */}
      <InvoiceDialogs
        mode="create"
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        creating={creating}
        setCreating={setCreating}
        setParams={(p: DocumentListParams | ((prev: DocumentListParams) => DocumentListParams)) => setParams(p)}
      />
      <InvoiceDialogs
        mode="edit"
        editInvoice={editInvoice as EditDoc | null}
        setEditInvoice={setEditInvoice}
        updating={updating}
        setUpdating={setUpdating}
        setParams={(p: DocumentListParams | ((prev: DocumentListParams) => DocumentListParams)) => setParams(p)}
      />
      <InvoiceDialogs
        mode="delete"
        deleteInvoice={deleteInvoice as Document | null}
        setDeleteInvoice={setDeleteInvoice}
        setParams={(p: DocumentListParams | ((prev: DocumentListParams) => DocumentListParams)) => setParams(p)}
      />
    </ListPage>
  );
}
