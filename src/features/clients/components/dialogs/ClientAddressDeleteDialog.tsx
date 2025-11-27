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
import { removeClientAddress } from "@/data/clients.repository";
import type { ClientAddressDeleteProps } from "@/schemas/clients.schema";

export function ClientAddressDeleteDialog({
    deleteClientAddress,
    setDeleteClientAddress,
    setParams,
}: ClientAddressDeleteProps) {
    const handleConfirm = async () => {
        try {
            if (!deleteClientAddress?.id) return;
            await removeClientAddress(deleteClientAddress.id);
            toast.success("Adresse client supprimée");
            setDeleteClientAddress(null);
            setParams?.((p) => ({ ...p }));
        } catch (e) {
            console.error(e);
            toast.error("Erreur lors de la suppression");
        }
    };

    return (
        <AlertDialog open={!!deleteClientAddress} onOpenChange={(o) => { if (!o) setDeleteClientAddress(null); }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Supprimer {deleteClientAddress?.line1 ? `l'adresse « ${deleteClientAddress.line1} »` : "cette adresse"} ?
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