import * as React from "react";
import { InvoiceCreateDialog } from "./InvoiceCreateDialog";
import { InvoiceDeleteDialog } from "./InvoiceDeleteDialog";
import { InvoiceEditDialog } from "./InvoiceEditDialog";
import { DocumentDialogsProps } from "@/schemas/documents.schema";

export function InvoiceDialogs(props: DocumentDialogsProps) {
  const mode = ("mode" in props && props.mode) ? props.mode : "create";

  if (mode === "edit") {
    const p = props as Extract<DocumentDialogsProps, { mode: "edit" }>;
    return (
      <InvoiceEditDialog
        editInvoice={p.editInvoice}
        setEditInvoice={p.setEditInvoice}
        updating={p.updating}
        setUpdating={p.setUpdating}
        setParams={p.setParams}
      />
    );
  }

  if (mode === "delete") {
    const p = props as Extract<DocumentDialogsProps, { mode: "delete" }>;
    return (
      <InvoiceDeleteDialog
        deleteInvoice={p.deleteInvoice}
        setDeleteInvoice={p.setDeleteInvoice}
        setParams={p.setParams}
      />
    );
  }

  // Par défaut: création
  const p = props as Extract<DocumentDialogsProps, { mode?: "create" }>;
  return (
    <InvoiceCreateDialog
      isCreateOpen={p.isCreateOpen}
      setIsCreateOpen={p.setIsCreateOpen}
      creating={p.creating}
      setCreating={p.setCreating}
      setParams={p.setParams}
    />
  );
}
