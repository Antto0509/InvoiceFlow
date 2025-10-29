"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyForm } from "../CompanyForm";
import { updateCompany } from "@/data/companies.repository";
import type { Company, CompanyListParams } from "@/schemas/companies.schema";

export function CompanyEditDialog({
    editCompany,
    setEditCompany,
    updating,
    setUpdating,
    setParams,
}: {
    editCompany: Company | null;
    setEditCompany: (company: Company | null) => void;
    updating?: boolean;
    setUpdating?: (v: boolean) => void;
    setParams?: React.Dispatch<React.SetStateAction<CompanyListParams>>;
}) {
    const loading = !!updating;
    return (
        <Dialog open={!!editCompany} onOpenChange={(o) => { if (!o) setEditCompany(null); }}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Modifier la société</DialogTitle>
                </DialogHeader>
                {editCompany && (
                    <CompanyForm
                        loading={loading}
                        defaultValues={{
                            ...(editCompany as unknown as Partial<Company>),
                            legal_form: editCompany.legal_form ?? undefined,
                            siren: editCompany.siren ?? undefined,
                            siret: editCompany.siret ?? undefined,
                            vat_number: editCompany.vat_number ?? undefined,
                            rcs_city: editCompany.rcs_city ?? undefined,
                            ape_naf: editCompany.ape_naf ?? undefined,
                            share_capital: editCompany.share_capital ?? undefined,
                            website: editCompany.website ?? undefined,
                            email: editCompany.email ?? undefined,
                            phone: editCompany.phone ?? undefined,
                            logo_url: editCompany.logo_url ?? undefined,
                            default_currency: editCompany.default_currency ?? "EUR",
                            payment_terms: editCompany.payment_terms ?? undefined,
                            penalty_rate: editCompany.penalty_rate ?? undefined,
                            vat_regime: editCompany.vat_regime ?? undefined,
                            legal_notes: editCompany.legal_notes ?? undefined,
                        }}
                        onSubmit={async (values) => {
                            try {
                                setUpdating?.(true);
                                if (!editCompany?.id) return;
                                await updateCompany(editCompany.id, values);
                                toast.success("Société mise à jour");
                                setEditCompany(null);
                                setParams?.((p) => ({ ...p }));
                            } catch (e) {
                                console.error(e);
                                toast.error("Erreur lors de la mise à jour");
                            } finally {
                                setUpdating?.(false);
                            }
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}