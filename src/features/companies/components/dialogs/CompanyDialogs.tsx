import * as React from "react";
import { CompanyCreateDialog } from "./CompanyCreateDialog";
import { CompanyEditDialog } from "./CompanyEditDialog";
import { CompanyIdentityDialog } from "./CompanyIdentityDialog";
import { CompanyContactBrandingDialog } from "./CompanyContactBrandingDialog";
import { CompanyBillingDialog } from "./CompanyBillingDialog";
import { CompanyAddressesDialog } from "./CompanyAddressesDialog";
import { CompanyBankAccountsDialog } from "./CompanyBankAccountsDialog";
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

    if (mode === "editIdentity") {
        const p = props as Extract<CompanyDialogsProps, { mode: "editIdentity" }>;
        return (
            <CompanyIdentityDialog
                editCompanyIdentity={p.editCompanyIdentity}
                setEditCompanyIdentity={p.setEditCompanyIdentity}
                updating={p.updating}
                setUpdating={p.setUpdating}
                setParams={p.setParams}
            />
        );
    }

    if (mode === "editContactBranding") {
        const p = props as Extract<CompanyDialogsProps, { mode: "editContactBranding" }>;
        return (
            <CompanyContactBrandingDialog
                editCompanyContactBranding={p.editCompanyContactBranding}
                setEditCompanyContactBranding={p.setEditCompanyContactBranding}
                updating={p.updating}
                setUpdating={p.setUpdating}
                setParams={p.setParams}
            />
        );
    }

    if (mode === "editBilling") {
        const p = props as Extract<CompanyDialogsProps, { mode: "editBilling" }>;
        return (
            <CompanyBillingDialog
                editCompanyBilling={p.editCompanyBilling}
                setEditCompanyBilling={p.setEditCompanyBilling}
                updating={p.updating}
                setUpdating={p.setUpdating}
                setParams={p.setParams}
            />
        );
    }

    if (mode === "editAddresses") {
        const p = props as Extract<CompanyDialogsProps, { mode: "editAddresses" }>;
        return (
            <CompanyAddressesDialog
                companyId={p.company_id}
                editCompanyAddresses={p.editCompanyAddresses}
                setEditCompanyAddresses={p.setEditCompanyAddresses}
                updating={p.updating}
                setUpdating={p.setUpdating}
                setParams={p.setParams}
            />
        );
    }

    if (mode === "editBankAccounts") {
        const p = props as Extract<CompanyDialogsProps, { mode: "editBankAccounts" }>;
        return (
            <CompanyBankAccountsDialog
                companyId={p.company_id}
                editCompanyBankAccounts={p.editCompanyBankAccounts}
                setEditCompanyBankAccounts={p.setEditCompanyBankAccounts}
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