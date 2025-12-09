"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyForm } from "../forms/CompanyForm";
import { updateCompany } from "@/data/companies.repository";
import type { CompanyBilling, CompanyListParams } from "@/schemas/companies.schema";

export function CompanyBillingDialog({
    editCompanyBilling,
    setEditCompanyBilling,
    updating,
    setUpdating,
    setParams,
}: {
    editCompanyBilling: CompanyBilling | null;
    setEditCompanyBilling: (billing: CompanyBilling | null) => void;
    updating?: boolean;
    setUpdating?: (v: boolean) => void;
    setParams?: React.Dispatch<React.SetStateAction<CompanyListParams>>;
}) {
    const loading = !!updating;
    return (
        <Dialog open={!!editCompanyBilling} onOpenChange={(o) => { if (!o) setEditCompanyBilling(null); }}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Modifier la facturation de la société</DialogTitle>
                </DialogHeader>
                {editCompanyBilling && (
                    <CompanyForm
                        defaultValues={{
                            ...(editCompanyBilling as unknown as Partial<CompanyBilling>),
                            default_currency: editCompanyBilling.default_currency ?? "EUR",
                            recovery_fee_enabled: editCompanyBilling.recovery_fee_enabled ?? true,
                            payment_terms: editCompanyBilling.payment_terms ?? undefined,
                            penalty_rate: editCompanyBilling.penalty_rate ?? undefined,
                            vat_regime: editCompanyBilling.vat_regime ?? undefined,
                            legal_notes: editCompanyBilling.legal_notes ?? undefined,
                        }}
                        onSubmit={async (values) => {
                            try {
                                setUpdating?.(true);
                                if (!editCompanyBilling?.id) return;
                                await updateCompany(editCompanyBilling.id, values);
                                toast.success("Facturation de la société mise à jour");
                                setEditCompanyBilling(null);
                                setParams?.((p) => ({ ...p }));
                            } catch {
                                toast.error("Erreur lors de la mise à jour de la facturation de la société");
                            } finally {
                                setUpdating?.(false);
                            }
                        }}
                        loading={loading}
                        show="billing"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
