"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ClientForm } from "./ClientForm";
import { useClientsTable } from "./table/useClientsTable";
import { ClientsToolbar } from "./table/ClientsToolbar";
import { BulkBar } from "./table/BulkBar";
import { BulkAddDialog } from "./table/BulkAddDialog";
import { BulkEditDialog } from "./table/BulkEditDialog";
import { Th } from "./table/Th";
import { Pagination } from "./table/Pagination";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

export function ClientsTable() {
  const {
    // data/state
    loading, filtered, total,
    // query/sort/pagination
    query, setQuery, sortKey, sortDir, setSortKey, setSortDir,
    page, pageSize, setPage, setPageSize,
    // dialogs
    isCreateOpen, setIsCreateOpen, editClient, setEditClient, deleteClient, setDeleteClient,
    isBulkAddOpen, setIsBulkAddOpen, isBulkEditOpen, setIsBulkEditOpen,
    // selection
    selected, allSelected, toggleAll, toggleOne, selectAllRef,
    // handlers
    handleCreate, requestUpdateConfirm, confirmApplySingleEdit, cancelSingleEditConfirm,
    handleDelete, onBulkDeleteConfirmed, handleBulkEditApply, handleBulkAdd,
    exportCurrentPageCSV, exportAllCSV,
    // confirm edit unitaire
    confirmSingleEditOpen, currentEditingName,
    // table header click
    toggleSortBy,
  } = useClientsTable();

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
      />

      {selected.size > 0 && (
        <BulkBar
          count={selected.size}
          onBulkDelete={onBulkDeleteConfirmed}
          onOpenBulkEdit={() => setIsBulkEditOpen(true)}
        />
      )}

      <div className="rounded-2xl border">
        <table className="w-full text-sm">
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
              <Th label="Email" column="email" sortKey={sortKey} sortDir={sortDir} onSort={toggleSortBy} />
              <Th label="Société" column="company" sortKey={sortKey} sortDir={sortDir} onSort={toggleSortBy} />
              <Th label="Créé le" column="created_at" sortKey={sortKey} sortDir={sortDir} onSort={toggleSortBy} />

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
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.company ?? "—"}</td>
                <td className="p-3">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    {/* Éditer */}
                    <Dialog open={!!editClient && editClient.id === c.id} onOpenChange={(o) => !o && setEditClient(null)}>
                      <DialogTrigger asChild>
                        <Button variant="secondary" onClick={() => setEditClient(c)}>Éditer</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader><DialogTitle>Modifier le client</DialogTitle></DialogHeader>
                        {/* La soumission déclenche une confirmation via requestUpdateConfirm */}
                        <ClientForm defaultValues={c} onSubmit={requestUpdateConfirm} />
                      </DialogContent>
                    </Dialog>

                    {/* Supprimer */}
                    <Dialog open={!!deleteClient && deleteClient.id === c.id} onOpenChange={(o) => !o && setDeleteClient(null)}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" onClick={() => setDeleteClient(c)}>Supprimer</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Supprimer {c.name} ?</DialogTitle></DialogHeader>
                        <p>Cette action est irréversible.</p>
                        <DialogFooter>
                          <Button variant="secondary" onClick={() => setDeleteClient(null)}>Annuler</Button>
                          <Button variant="destructive" onClick={() => handleDelete(c.id)}>Confirmer</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
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

      {/* Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />

      {/* Nouveau client */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild />
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Créer un client</DialogTitle></DialogHeader>
          <ClientForm onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>

      {/* Ajout en lot */}
      <BulkAddDialog open={isBulkAddOpen} onOpenChange={setIsBulkAddOpen} onSubmit={handleBulkAdd} />

      {/* Édition en lot */}
      <BulkEditDialog
        open={isBulkEditOpen}
        onOpenChange={setIsBulkEditOpen}
        onConfirm={(patch) => handleBulkEditApply(patch)}
        selectedCount={selected.size}
      />

      {/* Confirmation modif unitaire */}
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
    </div>
  );
}
