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

import { removeDocument } from "@/data/documents.repository";
import { listDocumentLines, deleteDocumentLines } from "@/data/documentLines.repository";
import type { Document, DocumentListParams } from "@/schemas/documents.schema";

export function InvoiceDeleteDialog({
  deleteInvoice,
  setDeleteInvoice,
  setParams,
}: {
  deleteInvoice: Document | null; // ex-Invoice
  setDeleteInvoice: (inv: Document | null) => void;
  setParams?: React.Dispatch<React.SetStateAction<DocumentListParams>>;
}) {
  const handleConfirm = async () => {
    try {
      if (!deleteInvoice?.id) return;

      // 1) Tentative simple : supprime le document
      try {
        await removeDocument(deleteInvoice.id);
      } catch (err: unknown) {
        // 2) Si contrainte FK (pas de CASCADE), on supprime d’abord les lignes puis on ré-essaie
        const getErrorInfo = (e: unknown): { code?: string; message?: string } => {
          if (typeof e !== "object" || e === null) return {};
          const obj = e as Record<string, unknown>;
          const code =
            typeof obj["code"] === "string"
              ? (obj["code"] as string)
              : undefined;
          const cause = obj["cause"];
          const causeCode =
            typeof cause === "object" && cause !== null && typeof (cause as Record<string, unknown>)["code"] === "string"
              ? ((cause as Record<string, unknown>)["code"] as string)
              : undefined;
          const message =
            typeof obj["message"] === "string"
              ? (obj["message"] as string)
              : undefined;
          return { code: code ?? causeCode, message };
        };

        const { code: pgCode, message } = getErrorInfo(err);
        const isFk =
          (typeof pgCode === "string" && pgCode.includes("23503")) ||
          /foreign key/i.test(message ?? "");
        if (!isFk) throw err;

        const lines = await listDocumentLines(deleteInvoice.id);
        if (lines.length) {
          await deleteDocumentLines(lines.map((l) => l.id));
        }
        await removeDocument(deleteInvoice.id);
      }

      toast.success("Facture supprimée");
      setDeleteInvoice(null);
      setParams?.((p) => ({ ...p })); // refresh liste
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la suppression");
    }
  };

  const displayNumber = deleteInvoice?.number ?? (deleteInvoice as Document)?.number_readonly ?? null;

  return (
    <AlertDialog open={!!deleteInvoice} onOpenChange={(o) => { if (!o) setDeleteInvoice(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Supprimer {displayNumber ? `la facture « ${displayNumber} »` : "cette facture"} ?
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
