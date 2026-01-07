"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyForm } from "../forms/CompanyForm";
import { updateCompany } from "@/data/companies.repository";
import type { CompanyIdentity, CompanyListParams } from "@/schemas/companies.schema";

export function CompanyIdentityDialog({
    editCompanyIdentity,
    setEditCompanyIdentity,
    updating,
    setUpdating,
    setParams,
}: {
    editCompanyIdentity: CompanyIdentity | null;
    setEditCompanyIdentity: (identity: CompanyIdentity | null) => void;
    updating?: boolean;
    setUpdating?: (v: boolean) => void;
    setParams?: React.Dispatch<React.SetStateAction<CompanyListParams>>;
}) {
    const loading = !!updating;
    return (
        <Dialog open={!!editCompanyIdentity} onOpenChange={(o) => { if (!o) setEditCompanyIdentity(null); }}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Modifier l&apos;identité de la société</DialogTitle>
                </DialogHeader>
                {editCompanyIdentity && (
                    <CompanyForm
                        defaultValues={{
                            ...(editCompanyIdentity as unknown as Partial<CompanyIdentity>),
                            name: editCompanyIdentity.name ?? undefined,
                            legal_form: editCompanyIdentity.legal_form ?? undefined,
                            siren: editCompanyIdentity.siren ?? undefined,
                            siret: editCompanyIdentity.siret ?? undefined,
                            vat_number: editCompanyIdentity.vat_number ?? undefined,
                            rcs_city: editCompanyIdentity.rcs_city ?? undefined,
                            ape_naf: editCompanyIdentity.ape_naf ?? undefined,
                            share_capital: editCompanyIdentity.share_capital ?? undefined,
                        }}
                        onSubmit={async (values) => {
                            try {
                                setUpdating?.(true);
                                if (!editCompanyIdentity?.id) return;
                                await updateCompany(editCompanyIdentity.id, values);
                                toast.success("Identité de la société mise à jour");
                                setEditCompanyIdentity(null);
                                setParams?.((p) => ({ ...p }));
                            } catch {
                                toast.error("Erreur lors de la mise à jour de l'identité de la société");
                            } finally {
                                setUpdating?.(false);
                            }
                        }}
                        loading={loading}
                        show="identity"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
