"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentForm } from "../DocumentForm";

import { updateDocument } from "@/data/documents.repository";
import { replaceDocumentLines } from "@/data/documentLines.repository";
import type { DocumentLine, DocumentEditProps } from "@/features/documents/schemas/documents.schema";

import { toastSuccessMessage } from "@/lib/utils";

export function DocumentEditDialog({
  kind,
  editDocument,
  setEditDocument,
  updating,
  setUpdating,
  setParams,
}: DocumentEditProps) {
  const loading = !!updating;

  return (
    <Dialog open={!!editDocument} onOpenChange={(o) => { if (!o) setEditDocument(null); }}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Modifier la facture</DialogTitle>
        </DialogHeader>

        {editDocument && (
          <DocumentForm
            kind={kind}
            loading={loading}
            defaultValues={{
              ...editDocument,
              client_id: (editDocument.client_id ?? undefined) as string | undefined,
              company_id: (editDocument.company_id ?? undefined) as string | undefined,
              due_date: editDocument.due_date ?? undefined,
              number: editDocument.number ?? undefined,
              currency_code: editDocument.currency_code ?? undefined,
              subtotal: editDocument.subtotal ?? undefined,
              tax: editDocument.tax ?? undefined,
              total: editDocument.total ?? undefined,
              pdf_url: editDocument.pdf_url ?? undefined,
              lines: (editDocument.lines ?? []).map((ln) => ({
                id: ln.id,
                kind: ln.kind,
                description: ln.description,
                qty: ln.qty,
                unit_price: ln.unit_price,
                unit: ln.unit ?? null,
                discount_rate: ln.discount_rate ?? null,
                discount_amount: ln.discount_amount ?? null,
                tax_rate: ln.tax_rate ?? null,
              })),
            }}
            onSubmit={async (values) => {
              try {
                setUpdating?.(true);
                if (!editDocument?.id) return;

                // 1) Update du document (métadonnées)
                await updateDocument(editDocument.id, {
                  client_id: values.client_id ?? null,
                  company_id: values.company_id ?? null,
                  issue_date: values.issue_date,
                  due_date: values.due_date ?? null,
                  currency_code: values.currency_code ?? null,
                  notes_public: values.notes_public ?? null,
                  notes_private: values.notes_private ?? null,
                  payment_terms: values.payment_terms ?? null,
                  penalty_rate: values.penalty_rate ?? null,
                  recovery_fee: values.recovery_fee ?? null,
                  status: values.status ?? "draft",
                  subtotal: values.subtotal ?? null,
                  tax: values.tax ?? null,
                  total: values.total ?? null,
                });

                // 2) Replace total des lignes
                const incoming = (values.lines ?? []).map((ln, idx) => ({
                  ...(ln as Partial<DocumentLine>),
                  // optionnel mais conseillé si tu utilises position pour l’ordre
                  position: (ln as Partial<DocumentLine>).position ?? idx,
                }));

                await replaceDocumentLines(editDocument.id, incoming);


                toastSuccessMessage(kind, "mis à jour");

                setEditDocument(null);
                setParams?.((p) => ({ ...p })); // refresh liste
              } catch (e) {
                console.error(e);
                toast.error("Erreur lors de la mise à jour");
              } finally {
                setUpdating?.(false);
              }
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
