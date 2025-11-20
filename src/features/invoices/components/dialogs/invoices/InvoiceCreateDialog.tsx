"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentForm } from "../../DocumentForm";

import { createDocumentWithLines } from "@/data/documents.repository";
import type { DocumentFormValues, DocumentCreateProps } from "@/schemas/documents.schema";

export function InvoiceCreateDialog({
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
          <DialogTitle>Créer une facture</DialogTitle>
        </DialogHeader>

        <DocumentForm
          kind="invoice"
          loading={creating}
          onSubmit={async (values) => {
            try {
              setCreating(true);

              await createDocumentWithLines(values as DocumentFormValues);

              toast.success("Facture créée");
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
