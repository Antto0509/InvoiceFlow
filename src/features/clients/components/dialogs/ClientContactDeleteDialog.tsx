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
import { removeClientContact } from "@/data/clients.repository";
import type { ClientContactDeleteProps } from "@/schemas/clients.schema";

export function ClientContactDeleteDialog({
    deleteClientContact,
    setDeleteClientContact,
    setParams,
}: ClientContactDeleteProps) {
    const handleConfirm = async () => {
        try {
            if (!deleteClientContact?.id) return;
            await removeClientContact(deleteClientContact.id);
            toast.success("Contact client supprimé");
            setDeleteClientContact(null);
            setParams?.((p) => ({ ...p }));
        } catch (e) {
            console.error(e);
            toast.error("Erreur lors de la suppression");
        }
    };

    return (
        <AlertDialog open={!!deleteClientContact} onOpenChange={(o) => { if (!o) setDeleteClientContact(null); }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Supprimer {deleteClientContact?.full_name ? `le contact « ${deleteClientContact.full_name} »` : "ce contact"} ?
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