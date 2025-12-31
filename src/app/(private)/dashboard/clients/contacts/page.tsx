"use client";

import * as React from "react";
import { ListPage } from "@/components/ListPage";
import { DataToolbar } from "@/components/datatable/DataToolbar";
import { Pagination } from "@/components/datatable/Pagination";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { useDataTable } from "@/hooks/useDataTable";
import { toast } from "sonner";
import { ExportMenu } from "@/components/datatable/toolbar/ExportMenu";

import { listClientContacts } from "@/data/clients.repository";
import type { ClientContact, ClientContactListParams, ClientContactSort } from "@/schemas/clients.schema";

import { ClientContactsTable, ClientDialogs } from "@/features/clients";

export default function ClientContactsPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [editClientContact, setEditClientContact] = React.useState<ClientContact | null>(null);
  const [updating, setUpdating] = React.useState(false);
  const [deleteClientContact, setDeleteClientContact] = React.useState<ClientContact | null>(null);
  const { data, total, loading, params, setParams } = useDataTable<ClientContact, ClientContactListParams>(
    async (p) => {
      const res = await listClientContacts({
        page: p.page,
        pageSize: p.pageSize,
        search: p.search,
        sort: p.sort,
      });
      return { rows: res.rows, total: res.total };
    },
    {
      page: 1,
      pageSize: 20,
      search: "",
      sort: { column: "full_name", dir: "asc" },
    }
  );

  const handleEdit = (row: ClientContact) => {
    setEditClientContact(row);
  };

  const handleDelete = (row: ClientContact) => {
    setDeleteClientContact(row);
  };

  return (
    <ListPage
      title="Contacts clients"
      description="Personnes de contact chez tes clients : gestion des emails, téléphones, rôles…"
      actions={
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Nouveau contact
        </Button>
      }
      toolbar={
        <DataToolbar
          placeholder="Rechercher un contact (nom, email, rôle)."
          search={params.search ?? ""}
          onSearch={(v) => setParams({ ...params, page: 1, search: v })}
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
      <ClientContactsTable
        data={data}
        loading={loading}
        sort={params.sort}
        onSortChange={(sort: ClientContactSort) => setParams({ ...params, sort })}
        onRowClick={(id: string) => {
          toast.info(`Cliqué sur le contact avec l'ID : ${id}`);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination
        total={total}
        page={params.page ?? 1}
        pageSize={params.pageSize ?? 20}
        onPageChange={(page) => setParams({ ...params, page })}
      />

      {/* Modales contacts */}
      <ClientDialogs
        mode="createContact"
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        creating={creating}
        setCreating={setCreating}
        setParams={setParams}
      />

      <ClientDialogs
        mode="editContact"
        editClientContact={editClientContact}
        setEditClientContact={setEditClientContact}
        updating={updating}
        setUpdating={setUpdating}
        setParams={setParams}
      />

      <ClientDialogs
        mode="deleteContact"
        deleteClientContact={deleteClientContact}
        setDeleteClientContact={setDeleteClientContact}
        setParams={setParams}
      />
    </ListPage>
  );
}
