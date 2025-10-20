"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceForm } from "../InvoiceForm";
import { updateInvoice } from "@/data/invoices.repository";
import { upsertItems } from "@/data/items.repository";
import type { Invoice, InvoiceListParams, InvoiceFormValues } from "@/schemas/invoices.schema";

export function InvoiceEditDialog({
  editInvoice,
  setEditInvoice,
  updating,
  setUpdating,
  setParams,
}: {
  editInvoice: Invoice | null;
  setEditInvoice: (inv: Invoice | null) => void;
  updating?: boolean;
  setUpdating?: (v: boolean) => void;
  setParams?: React.Dispatch<React.SetStateAction<InvoiceListParams>>;
}) {
  const loading = !!updating;

  return (
    <Dialog open={!!editInvoice} onOpenChange={(o) => { if (!o) setEditInvoice(null); }}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Modifier la facture</DialogTitle>
        </DialogHeader>
        {editInvoice && (
          <InvoiceForm
            loading={loading}
            defaultValues={{
              ...(editInvoice as unknown as Partial<InvoiceFormValues>),
              client_id: (editInvoice.client_id ?? undefined) as unknown as string,
              due_date: editInvoice.due_date ?? undefined,
              number: editInvoice.number ?? undefined,
              currency: editInvoice.currency ?? undefined,
              subtotal: editInvoice.subtotal ?? undefined,
              tax: editInvoice.tax ?? undefined,
              total: editInvoice.total ?? undefined,
              pdf_url: editInvoice.pdf_url ?? undefined,
              // items: left undefined; ItemsEditor handles initial row
            }}
            onSubmit={async (values) => {
              try {
                setUpdating?.(true);
                const { items, pdf_url, subtotal, tax, total, id, ...invoice } = values;
                if (!editInvoice?.id) return;
                await updateInvoice(editInvoice.id, invoice);
                await upsertItems(items);
                toast.success("Facture mise à jour");
                setEditInvoice(null);
                setParams?.((p) => ({ ...p }));
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
