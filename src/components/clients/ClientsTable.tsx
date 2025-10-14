"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClientForm } from "./ClientForm";
import { useClientsTable } from "./table/useClientsTable";
import { ClientsToolbar } from "./table/ClientsToolbar";
import { BulkBar } from "./table/BulkBar";
import { BulkAddDialog } from "./table/BulkAddDialog";
import { BulkEditDialog } from "./table/BulkEditDialog";
import { Th } from "./table/Th";
import { Pagination } from "./table/Pagination";
import { RowActions } from "./table/RowActions";
import { ClientCard } from "./table/ClientCard";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

export function ClientsTable() {
  const {
    loading, filtered, total,
    query, setQuery, sortKey, sortDir, setSortKey, setSortDir,
    page, pageSize, setPage, setPageSize,

    // ⬇️ récupère BIEN les états, pas seulement les setters
    isCreateOpen, setIsCreateOpen,
    editClient, setEditClient,
    deleteClient, setDeleteClient,

    isBulkAddOpen, setIsBulkAddOpen,
    isBulkEditOpen, setIsBulkEditOpen,

    selected, allSelected, toggleAll, toggleOne, selectAllRef,

    // handlers
    handleCreate, requestUpdateConfirm, confirmApplySingleEdit, cancelSingleEditConfirm,
    handleDelete, onBulkDeleteConfirmed, handleBulkEditApply, handleBulkAdd,
    exportCurrentPageCSV, exportAllCSV,

    // confirm edit unitaire (déjà gérée)
    confirmSingleEditOpen, currentEditingName,

    // table header click
    toggleSortBy,
  } = useClientsTable();

  // toggle list/card
  const [viewMode, setViewMode] = React.useState<"list" | "card">("list");
  const [density, setDensity] = React.useState<"normal" | "dense">("dense");
  const listView = viewMode === "list";
  const cardView = viewMode === "card";
  // Helpers d’affichage cartes
  const cardVariant = density === "dense" ? "compact" : "default";
  const cardGridClass =
    density === "dense"
      ? "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
      : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="space-y-4">
      <ClientsToolbar
        query={query}
        onQuery={setQuery}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenBulkAdd={() => setIsBulkAddOpen(true)}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortKeyChange={setSortKey}
        onSortDirChange={setSortDir}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        onExportPage={exportCurrentPageCSV}
        onExportAll={exportAllCSV}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        density={density}
        onDensityChange={setDensity}
      />

      {selected.size > 0 && (
        <BulkBar
          count={selected.size}
          onBulkDelete={onBulkDeleteConfirmed}
          onOpenBulkEdit={() => setIsBulkEditOpen(true)}
        />
      )}

      {/* Cartes */}
      {cardView && (
        <div className={cardGridClass}>
          {filtered.map((c) => (
            <ClientCard
              key={c.id}
              client={c}
              selected={selected.has(c.id)}
              onToggle={toggleOne}
              onEdit={(cl) => setEditClient(cl)}
              onDelete={(cl) => setDeleteClient(cl)}
              variant={cardVariant as "default" | "compact"}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-xl border p-6 text-center text-muted-foreground">
              {loading ? "Chargement..." : "Aucun client"}
            </div>
          )}
        </div>
      )}

      {/* Tableau */}
      {listView && (
        <div className="rounded-2xl border overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-10 p-3 align-middle">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    aria-label="Tout sélectionner"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                </th>

                <Th label="Nom" column="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSortBy} />
                <Th className="hidden md:table-cell" label="Email" column="email" sortKey={sortKey} sortDir={sortDir} onSort={toggleSortBy} />
                <Th className="hidden lg:table-cell" label="Société" column="company" sortKey={sortKey} sortDir={sortDir} onSort={toggleSortBy} />
                <Th className="hidden xl:table-cell" label="Créé le" column="created_at" sortKey={sortKey} sortDir={sortDir} onSort={toggleSortBy} />

                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-3 align-middle">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleOne(c.id)}
                      aria-label={`Sélectionner ${c.name}`}
                    />
                  </td>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 hidden md:table-cell">{c.email}</td>
                  <td className="p-3 hidden lg:table-cell">{c.company ?? "—"}</td>
                  <td className="p-3 hidden xl:table-cell">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-3">
                    <RowActions
                      client={c}
                      onEdit={(cl) => setEditClient(cl)}
                      onDelete={(cl) => setDeleteClient(cl)}
                    />
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    {loading ? "Chargement..." : "Aucun client"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="px-1">
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </div>

      {/* —— Modales globales —— */}

      {/* Nouveau client */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild />
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Créer un client</DialogTitle></DialogHeader>
          <ClientForm onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>

      {/* ÉDITER — une seule modale, basée sur editClient */}
      <Dialog open={!!editClient} onOpenChange={(o) => !o && setEditClient(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Modifier le client</DialogTitle></DialogHeader>
          {editClient && (
            <ClientForm
              defaultValues={editClient}
              onSubmit={(vals) => {
                const payload = { id: editClient.id, ...vals };
                requestUpdateConfirm(payload);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* SUPPRIMER — une seule modale, basée sur deleteClient */}
      <AlertDialog open={!!deleteClient} onOpenChange={(o) => !o && setDeleteClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer {deleteClient?.name ? `« ${deleteClient.name} »` : "ce client"} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteClient) handleDelete(deleteClient.id); }}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation modif unitaire (déjà fournie par le hook) */}
      <AlertDialog open={confirmSingleEditOpen} onOpenChange={(o) => !o && cancelSingleEditConfirm()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la modification</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de modifier <strong>{currentEditingName || "ce client"}</strong>. Continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApplySingleEdit}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import en lot */}
      <BulkAddDialog open={isBulkAddOpen} onOpenChange={setIsBulkAddOpen} onSubmit={handleBulkAdd} />

      {/* Édition en lot */}
      <BulkEditDialog
        open={isBulkEditOpen}
        onOpenChange={setIsBulkEditOpen}
        onConfirm={(patch) => handleBulkEditApply(patch)}
        selectedCount={selected.size}
      />
    </div>
  );
}
