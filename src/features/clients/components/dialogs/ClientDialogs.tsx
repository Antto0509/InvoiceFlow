import * as React from "react";

// Client dialogs
import { ClientCreateDialog } from "./ClientCreateDialog";
import { ClientEditDialog } from "./ClientEditDialog";
import { ClientDeleteDialog } from "./ClientDeleteDialog";

// Address dialogs
import { ClientAddressCreateDialog } from "./ClientAddressCreateDialog";
import { ClientAddressEditDialog } from "./ClientAddressEditDialog";
import { ClientAddressDeleteDialog } from "./ClientAddressDeleteDialog";

// Contact dialogs
import { ClientContactCreateDialog } from "./ClientContactCreateDialog";
import { ClientContactEditDialog } from "./ClientContactEditDialog";
import { ClientContactDeleteDialog } from "./ClientContactDeleteDialog";

// Types
import type { ClientDialogsProps } from "@/schemas/clients.schema";

/**
 * Composant générique pour gérer les différents dialogues clients
 * @param props Props spécifiques au dialogue
 * @returns Composant de dialogue approprié
 */
export function ClientDialogs(props: ClientDialogsProps) {
    const mode = ("mode" in props && props.mode) ? props.mode : "create";

    if (mode === "createAddress") {
        const p = props as Extract<ClientDialogsProps, { mode: "createAddress" }>;
        return (
            <ClientAddressCreateDialog
                isCreateOpen={p.isCreateOpen}
                setIsCreateOpen={p.setIsCreateOpen}
                creating={p.creating}
                setCreating={p.setCreating}
                setParams={p.setParams}
            />
        );
    }

    if (mode === "createContact") {
        const p = props as Extract<ClientDialogsProps, { mode: "createContact" }>;
        return (
            <ClientContactCreateDialog
                isCreateOpen={p.isCreateOpen}
                setIsCreateOpen={p.setIsCreateOpen}
                creating={p.creating}
                setCreating={p.setCreating}
                setParams={p.setParams}
            />
        );
    }

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

    if (mode === "editAddress") {
        const p = props as Extract<ClientDialogsProps, { mode: "editAddress" }>;
        return (
            <ClientAddressEditDialog
                editClientAddress={p.editClientAddress}
                setEditClientAddress={p.setEditClientAddress}
                updating={p.updating}
                setUpdating={p.setUpdating}
                setParams={p.setParams}
            />
        );
    }

    if (mode === "editContact") {
        const p = props as Extract<ClientDialogsProps, { mode: "editContact" }>;
        return (
            <ClientContactEditDialog
                editClientContact={p.editClientContact}
                setEditClientContact={p.setEditClientContact}
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

    if (mode === "deleteAddress") {
        const p = props as Extract<ClientDialogsProps, { mode: "deleteAddress" }>;
        return (
            <ClientAddressDeleteDialog
                deleteClientAddress={p.deleteClientAddress}
                setDeleteClientAddress={p.setDeleteClientAddress}
                setParams={p.setParams}
            />
        );
    }

    if (mode === "deleteContact") {
        const p = props as Extract<ClientDialogsProps, { mode: "deleteContact" }>;
        return (
            <ClientContactDeleteDialog
                deleteClientContact={p.deleteClientContact}
                setDeleteClientContact={p.setDeleteClientContact}
                setParams={p.setParams}
            />
        );
    }

    // Par défaut: création
    const p = props as Extract<ClientDialogsProps, { mode?: "create" }>;
    console.log("Rendering ClientCreateDialog with props:", p);
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