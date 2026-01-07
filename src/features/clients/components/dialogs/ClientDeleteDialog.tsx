"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { removeClient } from "@/data/clients.repository";
import type { ClientDeleteProps } from "@/schemas/clients.schema";

export function ClientDeleteDialog({
  deleteClient,
  setDeleteClient,
  setParams,
}: ClientDeleteProps) {
  const handleConfirm = async () => {
    try {
      if (!deleteClient?.id) return;
      await removeClient(deleteClient.id);
      toast.success("Client supprimé");
      setDeleteClient(null);
      setParams?.((p) => ({ ...p }));
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <AlertDialog open={!!deleteClient} onOpenChange={(o) => { if (!o) setDeleteClient(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Supprimer {deleteClient?.name ? `le client « ${deleteClient.name} »` : "ce client"} ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirmer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}