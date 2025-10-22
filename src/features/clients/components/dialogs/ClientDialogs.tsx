import * as React from "react";
import { ClientCreateDialog } from "./ClientCreateDialog";
import { ClientDeleteDialog } from "./ClientDeleteDialog";
import { ClientEditDialog } from "./ClientEditDialog";
import type { ClientDialogsProps } from "@/schemas/clients.schema";

export function ClientDialogs(props: ClientDialogsProps) {
    const mode = ("mode" in props && props.mode) ? props.mode : "create";

    if (mode === "edit") {
        const p = props as Extract<ClientDialogsProps, { mode: "edit" }>;
        return (
            <ClientEditDialog
                editClient={p.editClient}
                setEditClient={p.setEditClient}
                updating={p.updating}
                setUpdating={p.setUpdating}
                setParams={p.setParams}
            />
        );
    }

    if (mode === "delete") {
        const p = props as Extract<ClientDialogsProps, { mode: "delete" }>;
        return (
            <ClientDeleteDialog
                deleteClient={p.deleteClient}
                setDeleteClient={p.setDeleteClient}
                setParams={p.setParams}
            />
        );
    }

    // Par défaut: création
    const p = props as Extract<ClientDialogsProps, { mode?: "create" }>;
    return (
        <ClientCreateDialog
            isCreateOpen={p.isCreateOpen}
            setIsCreateOpen={p.setIsCreateOpen}
            creating={p.creating}
            setCreating={p.setCreating}
            setParams={p.setParams}
        />
    );
}