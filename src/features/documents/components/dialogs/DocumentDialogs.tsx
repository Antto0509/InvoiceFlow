import * as React from "react";
import { DocumentCreateDialog } from "./DocumentCreateDialog";
import { DocumentDeleteDialog } from "./DocumentDeleteDialog";
import { DocumentEditDialog } from "./DocumentEditDialog";
import { DocumentDialogsProps } from "@/schemas/documents.schema";

export function DocumentDialogs(props: DocumentDialogsProps) {
  const mode = ("mode" in props && props.mode) ? props.mode : "create";

  if (mode === "edit") {
    const p = props as Extract<DocumentDialogsProps, { mode: "edit" }>;
    return (
      <DocumentEditDialog
        kind={p.kind}
        editDocument={p.editDocument}
        setEditDocument={p.setEditDocument}
        updating={p.updating}
        setUpdating={p.setUpdating}
        setParams={p.setParams}
      />
    );
  }

  if (mode === "delete") {
    const p = props as Extract<DocumentDialogsProps, { mode: "delete" }>;
    return (
      <DocumentDeleteDialog
        kind={p.kind}
        deleteDocument={p.deleteDocument}
        setDeleteDocument={p.setDeleteDocument}
        setParams={p.setParams}
      />
    );
  }

  // Par défaut: création
  const p = props as Extract<DocumentDialogsProps, { mode?: "create" }>;
  return (
    <DocumentCreateDialog
      kind={p.kind}
      isCreateOpen={p.isCreateOpen}
      setIsCreateOpen={p.setIsCreateOpen}
      creating={p.creating}
      setCreating={p.setCreating}
      setParams={p.setParams}
    />
  );
}
