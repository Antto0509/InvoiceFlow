import React from "react"
import { CompanyDialogs } from "./CompanyDialogs"
import { 
  type Company,
  type CompanyIdentity, 
  type CompanyContactBranding, 
  type CompanyBilling, 
  type CompanyAddress, 
  type CompanyBankAccount 
} from "@/schemas/companies.schema";

export function CompanyAllDialogs({
    // Create
    isCreateOpen,
    setIsCreateOpen,
    creating,
    setCreating,
    // Edit
    editCompany,
    setEditCompany,
    editIdentityCompany,
    setEditIdentityCompany,
    editCompanyContactBranding,
    setEditCompanyContactBranding,
    editCompanyBilling,
    setEditCompanyBilling,
    editCompanyAddresses,
    setEditCompanyAddresses,
    editCompanyBankAccounts,
    setEditCompanyBankAccounts,
    updating,
    setUpdating,
    // Delete
    deleteCompany,
    setDeleteCompany,
    // Params
    setParams,
    // Active ID
    activeId,
  }: {
    // Create
    isCreateOpen: boolean;
    setIsCreateOpen: React.Dispatch<React.SetStateAction<boolean>>;
    creating: boolean;
    setCreating: React.Dispatch<React.SetStateAction<boolean>>;
    // Edit
    editCompany: Company | null;
    setEditCompany: React.Dispatch<React.SetStateAction<Company | null>>;
    editIdentityCompany: CompanyIdentity | null;
    setEditIdentityCompany: React.Dispatch<React.SetStateAction<CompanyIdentity | null>>;
    editCompanyContactBranding: CompanyContactBranding | null;
    setEditCompanyContactBranding: React.Dispatch<React.SetStateAction<CompanyContactBranding | null>>;
    editCompanyBilling: CompanyBilling | null;
    setEditCompanyBilling: React.Dispatch<React.SetStateAction<CompanyBilling | null>>;
    editCompanyAddresses: CompanyAddress[] | null;
    setEditCompanyAddresses: React.Dispatch<React.SetStateAction<CompanyAddress[] | null>>;
    editCompanyBankAccounts: CompanyBankAccount[] | null;
    setEditCompanyBankAccounts: React.Dispatch<React.SetStateAction<CompanyBankAccount[] | null>>;
    updating: boolean;
    setUpdating: React.Dispatch<React.SetStateAction<boolean>>;
    // Delete
    deleteCompany: Company | null;
    setDeleteCompany: React.Dispatch<React.SetStateAction<Company | null>>;
    // Params
    setParams: React.Dispatch<React.SetStateAction<import("@/schemas/companies.schema").CompanyListParams>>;
    // Active ID
    activeId: string | null;
  }) {
    return (
        <>
            {/* Modales CRUD */}
            <CompanyDialogs
                mode="create"
                isCreateOpen={isCreateOpen}
                setIsCreateOpen={setIsCreateOpen}
                creating={creating}
                setCreating={setCreating}
                setParams={setParams}
            />

            <CompanyDialogs
                mode="edit"
                editCompany={editCompany}
                setEditCompany={setEditCompany}
                updating={updating}
                setUpdating={setUpdating}
                setParams={setParams}
            />

            <CompanyDialogs
                mode="editIdentity"
                editCompanyIdentity={editIdentityCompany}
                setEditCompanyIdentity={setEditIdentityCompany}
                updating={updating}
                setUpdating={setUpdating}
                setParams={setParams}
            />
            
            <CompanyDialogs
                mode="editContactBranding"
                editCompanyContactBranding={editCompanyContactBranding}
                setEditCompanyContactBranding={setEditCompanyContactBranding}
                updating={updating}
                setUpdating={setUpdating}
                setParams={setParams}
            />
            
            <CompanyDialogs
                mode="editBilling"
                editCompanyBilling={editCompanyBilling}
                setEditCompanyBilling={setEditCompanyBilling}
                updating={updating}
                setUpdating={setUpdating}
                setParams={setParams}
            />

            <CompanyDialogs
                mode="editAddresses"
                company_id={activeId!}
                editCompanyAddresses={editCompanyAddresses}
                setEditCompanyAddresses={setEditCompanyAddresses}
                updating={updating}
                setUpdating={setUpdating}
                setParams={setParams}
            />

            <CompanyDialogs
                mode="editBankAccounts"
                company_id={activeId!}
                editCompanyBankAccounts={editCompanyBankAccounts}
                setEditCompanyBankAccounts={setEditCompanyBankAccounts}
                updating={updating}
                setUpdating={setUpdating}
                setParams={setParams}
            />

            <CompanyDialogs
                mode="delete"
                deleteCompany={deleteCompany}
                setDeleteCompany={setDeleteCompany}
                setParams={setParams}
            />
        </>
    );
}