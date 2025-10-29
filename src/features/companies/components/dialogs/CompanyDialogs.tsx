import * as React from "react";
import { CompanyCreateDialog } from "./CompanyCreateDialog";
import { CompanyEditDialog } from "./CompanyEditDialog";
import { CompanyDeleteDialog } from "./CompanyDeleteDialog";
import type { CompanyDialogsProps } from "@/schemas/companies.schema";

export function CompanyDialogs(props: CompanyDialogsProps) {
    const mode = ("mode" in props && props.mode) ? props.mode : "create";

    if (mode === "edit") {
        const p = props as Extract<CompanyDialogsProps, { mode: "edit" }>;
        return (
            <CompanyEditDialog
                editCompany={p.editCompany}
                setEditCompany={p.setEditCompany}
                updating={p.updating}
                setUpdating={p.setUpdating}
                setParams={p.setParams}
            />
        );
    }

    if (mode === "delete") {
        const p = props as Extract<CompanyDialogsProps, { mode: "delete" }>;
        return (
            <CompanyDeleteDialog
                deleteCompany={p.deleteCompany}
                setDeleteCompany={p.setDeleteCompany}
                setParams={p.setParams}
            />
        );
    }

    // Par défaut: création
    const p = props as Extract<CompanyDialogsProps, { mode?: "create" }>;
    return (
        <CompanyCreateDialog
            isCreateOpen={p.isCreateOpen}
            setIsCreateOpen={p.setIsCreateOpen}
            creating={p.creating}
            setCreating={p.setCreating}
            setParams={p.setParams}
        />
    );
}