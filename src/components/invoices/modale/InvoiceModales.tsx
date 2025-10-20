import * as React from "react";
import { InvoiceCreate } from "./InvoiceCreate";
import { InvoiceEdit } from "./InvoiceEdit";
import { InvoiceDelete } from "./InvoiceDelete";
import type { InvoiceModalesProps } from "@/schemas/invoices";

export function InvoiceModales(props: InvoiceModalesProps) {
  const mode = ("mode" in props && props.mode) ? props.mode : "create";

  if (mode === "edit") {
    const p = props as Extract<InvoiceModalesProps, { mode: "edit" }>;
    return (
      <InvoiceEdit
        editInvoice={p.editInvoice}
        setEditInvoice={p.setEditInvoice}
        updating={p.updating}
        setUpdating={p.setUpdating}
        setParams={p.setParams}
      />
    );
  }

  if (mode === "delete") {
    const p = props as Extract<InvoiceModalesProps, { mode: "delete" }>;
    return (
      <InvoiceDelete
        deleteInvoice={p.deleteInvoice}
        setDeleteInvoice={p.setDeleteInvoice}
        setParams={p.setParams}
      />
    );
  }

  // Par défaut: création
  const p = props as Extract<InvoiceModalesProps, { mode?: "create" }>;
  return (
    <InvoiceCreate
      isCreateOpen={p.isCreateOpen}
      setIsCreateOpen={p.setIsCreateOpen}
      creating={p.creating}
      setCreating={p.setCreating}
      setParams={p.setParams}
    />
  );
}
