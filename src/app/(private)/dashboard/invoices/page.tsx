"use client";
import * as React from "react";
import { ListPage } from "@/components/ListPage";
import { DataToolbar } from "@/components/datatable/DataToolbar";
import { Pagination } from "@/components/datatable/Pagination";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { InvoicesTable } from "@/features/invoices";
import { Toaster, toast } from "sonner";
import { useDataTable } from "@/hooks/useDataTable";
import { listInvoices } from "@/features/invoices";
import { InvoicesFilters } from "@/features/invoices";
import type { InvoiceListParams, InvoiceListRow } from "@/schemas/invoices.schema";
import { InvoiceDialogs } from "@/features/invoices";
import { ExportMenu } from "@/components/datatable/toolbar/ExportMenu";

export default function InvoicesPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const { data, total, loading, params, setParams } = useDataTable<InvoiceListRow, InvoiceListParams>(
    async (p) => {
      const res = await listInvoices({
        page: p.page,
        pageSize: p.pageSize,
        search: p.search,
        status: p.status,
        sort: p.sort,
      });
      return { rows: res.rows, total: res.total };
    },
    {
      page: 1,
      pageSize: 20,
      search: "",
      status: "all" as InvoiceListParams["status"],
      sort: { column: "issue_date", dir: "desc" },
    }
  );

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
              status={params.status ?? "all"}
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
      <InvoicesTable
        data={data}
        loading={loading}
        sort={params.sort}
        onSortChange={(s) => setParams({ ...params, sort: s })}
        onRowClick={(id) => {
          toast.info(`Cliqué sur la facture avec l'ID : ${id}`);
        }}
      />
      <Pagination
        page={params.page ?? 1}
        pageSize={params.pageSize ?? 20}
        total={total}
        onPageChange={(p) => setParams({ ...params, page: p })}
      />
      <Toaster richColors position="top-right" />

      {/* Modales invoices */}
      <InvoiceDialogs
        mode="create"
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        creating={creating}
        setCreating={setCreating}
        setParams={setParams}
      />
      <InvoiceDialogs
        mode="edit"
        editInvoice={null}
        setEditInvoice={() => {}}
        updating={false}
        setUpdating={() => {}}
        setParams={setParams}
      />
      <InvoiceDialogs
        mode="delete"
        deleteInvoice={null}
        setDeleteInvoice={() => {}}
        setParams={setParams}
      />
    </ListPage>
  );
}

