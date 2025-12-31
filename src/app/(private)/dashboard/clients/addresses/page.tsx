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

import { listClientAddresses } from "@/data/clients.repository";
import type { ClientAddress, ClientAddressListParams, ClientAddressSort } from "@/schemas/clients.schema";

import { ClientAddressesTable, ClientDialogs } from "@/features/clients";

export default function ClientAddressesPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [editClientAddress, setEditClientAddress] = React.useState<ClientAddress | null>(null);
  const [updating, setUpdating] = React.useState(false);
  const [deleteClientAddress, setDeleteClientAddress] = React.useState<ClientAddress | null>(null);
  const { data, total, loading, params, setParams } = useDataTable<ClientAddress, ClientAddressListParams>(
    async (p) => {
      const res = await listClientAddresses ({
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
      sort: { column: "city", dir: "asc" },
    }
  );

  const handleEdit = (row: ClientAddress) => {
    setEditClientAddress(row);
  };

  const handleDelete = (row: ClientAddress) => {
    setDeleteClientAddress(row);
  };

  return (
    <ListPage
      title="Adresses clients"
      description="Centralise et gère toutes les adresses de tes clients."
      actions={
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Nouvelle adresse
        </Button>
      }
      toolbar={
        <DataToolbar
          placeholder="Rechercher une adresse (rue, ville, code postal)."
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
      <ClientAddressesTable
        data={data}
        loading={loading}
        sort={params.sort}
        onSortChange={(sort: ClientAddressSort) => setParams({ ...params, sort })}
        onRowClick={(id: string) => {
          toast.info(`Cliqué sur l'adresse avec l'ID : ${id}`);
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

      {/* Modales adresses */}
      <ClientDialogs
        mode="createAddress"
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        creating={creating}
        setCreating={setCreating}
        setParams={setParams}
      />

      <ClientDialogs
        mode="editAddress"
        editClientAddress={editClientAddress}
        setEditClientAddress={setEditClientAddress}
        updating={updating}
        setUpdating={setUpdating}
        setParams={setParams}
      />

      <ClientDialogs
        mode="deleteAddress"
        deleteClientAddress={deleteClientAddress}
        setDeleteClientAddress={setDeleteClientAddress}
        setParams={setParams}
      />
    </ListPage>
  );
}
