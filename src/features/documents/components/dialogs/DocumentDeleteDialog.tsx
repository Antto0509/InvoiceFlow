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

import { removeDocument } from "@/features/documents/data/documents.repository";
import { listDocumentLines, deleteDocumentLines } from "@/features/documents/data/documentLines.repository";
import type { Document, DocumentDeleteProps } from "@/schemas/documents.schema";
import { toastSuccessMessage } from "@/lib/utils";

export function DocumentDeleteDialog({
  kind,
  deleteDocument,
  setDeleteDocument,
  setParams,
}: DocumentDeleteProps) {
  const handleConfirm = async () => {
    try {
      if (!deleteDocument?.id) return;

      // 1) Tentative simple : supprime le document
      try {
        await removeDocument(deleteDocument.id);
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

        const lines = await listDocumentLines(deleteDocument.id);
        if (lines.length) {
          await deleteDocumentLines(lines.map((l) => l.id));
        }
        await removeDocument(deleteDocument.id);
      }

      toastSuccessMessage(kind, "supprimé");

      setDeleteDocument(null);
      setParams?.((p) => ({ ...p })); // refresh liste
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la suppression");
    }
  };

  const displayNumber = deleteDocument?.number ?? (deleteDocument as Document)?.number_readonly ?? null;
  let dispKind = "le document";
  if ( kind === "invoice") {
    dispKind = "la facture";
  } else if ( kind === "quote") {
    dispKind = "le devis";
  } else if ( kind === "credit_note") {
    dispKind = "la note de crédit";
  } else if ( kind === "proforma") {
    dispKind = "la proforma";
  }

  return (
    <AlertDialog open={!!deleteDocument} onOpenChange={(o) => { if (!o) setDeleteDocument(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Supprimer {displayNumber ? `${dispKind} « ${displayNumber} »` : `ce ${dispKind}`} ?
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
