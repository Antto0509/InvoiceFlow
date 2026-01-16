"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentForm } from "../DocumentForm";

import { createDocumentWithLines } from "@/features/documents/data/documents.repository";
import type { DocumentFormValues, DocumentCreateProps } from "@/schemas/documents.schema";
import { toastSuccessMessage } from "@/lib/utils";

export function DocumentCreateDialog({
  kind,
  isCreateOpen,
  setIsCreateOpen,
  creating,
  setCreating,
  setParams,
}: DocumentCreateProps) {
  return (
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Créer {kind === "invoice" ? "une facture" : kind === "quote" ? "un devis" : kind === "credit_note" ? "un avoir" : "une proforma"}</DialogTitle>
        </DialogHeader>

        <DocumentForm
          kind={kind}
          loading={creating}
          onSubmit={async (values) => {
            try {
              setCreating(true);

              await createDocumentWithLines(values as DocumentFormValues);

              toastSuccessMessage(kind, "créé");
              
              setIsCreateOpen(false);
              setParams((p) => ({ ...p })); // refresh liste
            } catch (e) {
              console.error(e);
              toast.error("Erreur lors de la création");
            } finally {
              setCreating(false);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
