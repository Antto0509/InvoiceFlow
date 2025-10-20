"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InvoiceForm } from "../InvoiceForm";
import { createInvoice } from "@/data/invoices.repository";
import { upsertItems } from "@/data/items.repository";
import type { InvoiceListParams } from "@/schemas/invoices.schema";

export function InvoiceCreateDialog({
  isCreateOpen,
  setIsCreateOpen,
  creating,
  setCreating,
  setParams,
}: {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  creating: boolean;
  setCreating: (v: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<InvoiceListParams>>;
}) {
  return (
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogTrigger asChild />
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Créer une facture</DialogTitle>
        </DialogHeader>
        <InvoiceForm
          loading={creating}
          onSubmit={async (values) => {
            try {
              setCreating(true);
              const { items, pdf_url, subtotal, tax, total, ...invoice } = values;
              await createInvoice(invoice);
              await upsertItems(items);
              toast.success("Facture créée");
              setIsCreateOpen(false);
              // refresh list
              setParams((p) => ({ ...p }));
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

