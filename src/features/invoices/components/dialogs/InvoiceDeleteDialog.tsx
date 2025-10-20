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
import { removeInvoice } from "@/data/invoices.repository";
import type { Invoice, InvoiceListParams } from "@/schemas/invoices.schema";

export function InvoiceDeleteDialog({
  deleteInvoice,
  setDeleteInvoice,
  setParams,
}: {
  deleteInvoice: Invoice | null;
  setDeleteInvoice: (inv: Invoice | null) => void;
  setParams?: React.Dispatch<React.SetStateAction<InvoiceListParams>>;
}) {
  const handleConfirm = async () => {
    try {
      if (!deleteInvoice?.id) return;
      await removeInvoice(deleteInvoice.id);
      toast.success("Facture supprimée");
      setDeleteInvoice(null);
      setParams?.((p) => ({ ...p }));
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <AlertDialog open={!!deleteInvoice} onOpenChange={(o) => { if (!o) setDeleteInvoice(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Supprimer {deleteInvoice?.number ? `la facture « ${deleteInvoice.number} »` : "cette facture"} ?
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

