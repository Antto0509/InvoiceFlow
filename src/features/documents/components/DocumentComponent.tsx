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

import {
    DocumentsTable, 
    listDocuments, 
    getDocumentDetail,
    Document, 
    EditDoc, 
    DocumentListRow,
    DocumentListParams,
    DocumentStatus,
    DocumentsFilters,
    DocumentDialogs, 
    DocumentsComponentProps
} from "@/features/documents";
import { labelDocKind } from "@/lib/utils";

export default function DocumentComponent({ kind }: DocumentsComponentProps): React.ReactElement {
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
        kind: p.kind,
      });
      return { rows: res.rows, total: res.total };
    },
    {
      page: 1,
      pageSize: 20,
      search: "",
      status: "all",
      sort: { column: "issue_date", dir: "desc" },
      kind: kind,
    }
  );

  // Handlers pour la table
  const handleEdit = async (row: DocumentListRow) => {
    try {
      setUpdating(true);
      const full = await getDocumentDetail(row.id);
      setEditInvoice(full as EditDoc);
    } catch (e) {
      if ( kind === "invoice") {
        toast.error("Impossible de charger la facture");
      } else if ( kind === "quote") {
        toast.error("Impossible de charger le devis");
      } else if ( kind === "credit_note") {
        toast.error("Impossible de charger l'avoir");
      } else if ( kind === "proforma") {
        toast.error("Impossible de charger le proforma");
      }
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
      title={labelDocKind(kind) === "Devis" ? "Devis" : labelDocKind(kind) + "s"}
      description={`Gère tes ${labelDocKind(kind).toLowerCase() === "devis" ? "devis" : labelDocKind(kind).toLowerCase() + "s"} : ajouter, éditer, supprimer.`}
      actions={
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" /> {kind === "invoice" ? "Nouvelle facture" : kind === "quote" ? "Nouveau devis" : kind === "credit_note" ? "Nouvel avoir" : "Nouveau proforma"}
        </Button>
      }
      toolbar={
        <DataToolbar
          placeholder={`Rechercher ${kind === "invoice" ? "une facture" : kind === "quote" ? "un devis" : kind === "credit_note" ? "un avoir" : "un proforma"} (n° ou client).`}
          search={params.search ?? ""}
          onSearch={(v) => setParams({ ...params, page: 1, search: v })}
          left={
            <DocumentsFilters
              kind={kind}
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
          toast.info(`Cliqué sur ${kind === "invoice" ? "la facture" : kind === "quote" ? "le devis" : kind === "credit_note" ? "l'avoir" : "le proforma"} #${id}`);
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

      {/* Modales */}
      <DocumentDialogs
        mode="create"
        kind={kind}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        creating={creating}
        setCreating={setCreating}
        setParams={(p: DocumentListParams | ((prev: DocumentListParams) => DocumentListParams)) => setParams(p)}
      />
      <DocumentDialogs
        mode="edit"
        kind={kind}
        editDocument={editInvoice as EditDoc | null}
        setEditDocument={setEditInvoice}
        updating={updating}
        setUpdating={setUpdating}
        setParams={(p: DocumentListParams | ((prev: DocumentListParams) => DocumentListParams)) => setParams(p)}
      />
      <DocumentDialogs
        mode="delete"
        kind={kind}
        deleteDocument={deleteInvoice as Document | null}
        setDeleteDocument={setDeleteInvoice}
        setParams={(p: DocumentListParams | ((prev: DocumentListParams) => DocumentListParams)) => setParams(p)}
      />
    </ListPage>
  );
}
