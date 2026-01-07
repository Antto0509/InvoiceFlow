"use client";
import * as React from "react";
import { ListPage } from "@/components/ListPage";
import { ClientsTable, ClientDialogs } from "@/features/clients";
import { DataToolbar } from "@/components/datatable/DataToolbar";
import { Pagination } from "@/components/datatable/Pagination";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { useDataTable } from "@/hooks/useDataTable";
import { listClients } from "@/data/clients.repository";
import type { ClientListParams, ClientListRow, Client } from "@/schemas/clients.schema";
import { toast } from "sonner";
import { ExportMenu } from "@/components/datatable/toolbar/ExportMenu";

export default function ClientsPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [editClient, setEditClient] = React.useState<Client | null>(null);
  const [updating, setUpdating] = React.useState(false);
  const [deleteClient, setDeleteClient] = React.useState<Client | null>(null);
  const { data, total, loading, params, setParams } = useDataTable<ClientListRow, ClientListParams>(
    async (p) => {
      const res = await listClients({
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
      name: "all" as ClientListParams["name"],
      hasEmail: "all" as unknown as ClientListParams["hasEmail"],
      sort: { column: "name", dir: "asc" },
    }
  );

  // Handlers envoyés à la table (RowActions les utilisera)
  const handleEdit = (row: ClientListRow) => {
    // si ClientListRow est compatible avec Client, sinon mappe ce qu’il faut
    setEditClient(row as unknown as Client);
  };

  const handleDelete = (row: ClientListRow) => {
    setDeleteClient(row as unknown as Client);
  };

  return (
    <ListPage
      title="Clients"
      description="Gère tes clients : ajouter, éditer, supprimer."
      actions={
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Nouveau client
        </Button>
      }
      toolbar={
        <DataToolbar
          placeholder="Rechercher un client (nom, email, téléphone)."
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
      <ClientsTable
        data={data}
        loading={loading}
        sort={params.sort}
        onSortChange={(sort) => setParams({ ...params, sort })}
        onRowClick={(id) => {
          toast.info(`Cliqué sur le client avec l'ID : ${id}`);
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

      {/* Modales clients */}
      <ClientDialogs
        mode="create"
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        creating={creating}
        setCreating={setCreating}
        setParams={setParams}
      />

      <ClientDialogs
        mode="edit"
        editClient={editClient}
        setEditClient={setEditClient}
        updating={updating}
        setUpdating={setUpdating}
        setParams={setParams}
      />

      <ClientDialogs
        mode="delete"
        deleteClient={deleteClient}
        setDeleteClient={setDeleteClient}
        setParams={setParams}
      />
    </ListPage>
  );
}

