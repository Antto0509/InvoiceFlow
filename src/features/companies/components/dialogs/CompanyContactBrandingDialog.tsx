"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyForm } from "../forms/CompanyForm";
import { updateCompany } from "@/data/companies.repository";
import type { CompanyContactBranding, CompanyListParams } from "@/schemas/companies.schema";

export function CompanyContactBrandingDialog({
    editCompanyContactBranding,
    setEditCompanyContactBranding,
    updating,
    setUpdating,
    setParams,
}: {
    editCompanyContactBranding: CompanyContactBranding | null;
    setEditCompanyContactBranding: (contactBranding: CompanyContactBranding | null) => void;
    updating?: boolean;
    setUpdating?: (v: boolean) => void;
    setParams?: React.Dispatch<React.SetStateAction<CompanyListParams>>;
}) {
    const loading = !!updating;
    return (
            <Dialog open={!!editCompanyContactBranding} onOpenChange={(o) => { if (!o) setEditCompanyContactBranding(null); }}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Modifier l&apos;identité de la société</DialogTitle>
                    </DialogHeader>
                    {editCompanyContactBranding && (
                        <CompanyForm
                            defaultValues={{
                                ...(editCompanyContactBranding as unknown as Partial<CompanyContactBranding>),
                                website: editCompanyContactBranding.website ?? undefined,
                                email: editCompanyContactBranding.email ?? undefined,
                                phone: editCompanyContactBranding.phone ?? undefined,
                                logo_url: editCompanyContactBranding.logo_url ?? undefined,
                            }}
                            onSubmit={async (values) => {
                                try {
                                    setUpdating?.(true);
                                    if (!editCompanyContactBranding?.id) return;
                                    await updateCompany(editCompanyContactBranding.id, values);
                                    toast.success("Identité de la société mise à jour");
                                    setEditCompanyContactBranding(null);
                                    setParams?.((p) => ({ ...p }));
                                } catch {
                                    toast.error("Erreur lors de la mise à jour de l'identité de la société");
                                } finally {
                                    setUpdating?.(false);
                                }
                            }}
                            loading={loading}
                            show="contact_branding"
                        />
                    )}
                </DialogContent>
            </Dialog>
        );
}
