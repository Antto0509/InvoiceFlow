"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentForm } from "../../DocumentForm";

import { updateDocument } from "@/data/documents.repository";
import { upsertDocumentLines, deleteDocumentLines } from "@/data/documentLines.repository";
import type { EditDoc, DocumentListParams, DocumentLine } from "@/schemas/documents.schema";

export function InvoiceEditDialog({
  editInvoice,
  setEditInvoice,
  updating,
  setUpdating,
  setParams,
}: {
  editInvoice: EditDoc | null;
  setEditInvoice: (inv: EditDoc | null) => void;
  updating?: boolean;
  setUpdating?: (v: boolean) => void;
  setParams?: React.Dispatch<React.SetStateAction<DocumentListParams>>;
}) {
  const loading = !!updating;

  return (
    <Dialog open={!!editInvoice} onOpenChange={(o) => { if (!o) setEditInvoice(null); }}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Modifier la facture</DialogTitle>
        </DialogHeader>

        {editInvoice && (
          <DocumentForm
            kind="invoice"
            loading={loading}
            defaultValues={{
              ...editInvoice,
              client_id: (editInvoice.client_id ?? undefined) as string | undefined,
              company_id: (editInvoice.company_id ?? undefined) as string | undefined,
              due_date: editInvoice.due_date ?? undefined,
              number: editInvoice.number ?? undefined,
              currency_code: editInvoice.currency_code ?? undefined,
              subtotal: editInvoice.subtotal ?? undefined,
              tax: editInvoice.tax ?? undefined,
              total: editInvoice.total ?? undefined,
              pdf_url: editInvoice.pdf_url ?? undefined,
              lines: (editInvoice.lines ?? []).map((ln) => ({
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
                if (!editInvoice?.id) return;

                // 1) Update du document (métadonnées)
                await updateDocument(editInvoice.id, {
                  client_id: values.client_id ?? null,
                  company_id: values.company_id ?? null,
                  issue_date: values.issue_date,
                  due_date: values.due_date ?? null,
                  currency_code: values.currency_code ?? null,
                  notes_public: values.notes_public ?? null,
                  payment_terms: values.payment_terms ?? null,
                  penalty_rate: values.penalty_rate ?? null,
                  recovery_fee: values.recovery_fee ?? null,
                });

                // 2) Upsert des lignes (ajout + maj)
                const incoming = (values.lines ?? []).map((ln) => ({
                  ...(ln as Partial<DocumentLine>),
                  document_id: editInvoice.id,
                })) as Array<Partial<DocumentLine>>;
                await upsertDocumentLines(incoming);

                // 3) Suppression des lignes retirées par l’utilisateur
                const originalIds = new Set((editInvoice.lines ?? []).map((l) => l.id));
                const incomingIds = new Set(incoming.map((l: Partial<DocumentLine>) => l.id).filter(Boolean) as string[]);
                const toDelete = [...originalIds].filter((id) => id && !incomingIds.has(id));
                if (toDelete.length) {
                  await deleteDocumentLines(toDelete as string[]);
                }

                toast.success("Facture mise à jour");
                setEditInvoice(null);
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
