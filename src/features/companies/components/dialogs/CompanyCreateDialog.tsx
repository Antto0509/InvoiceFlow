"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CompanyForm } from "../forms/CompanyForm";
import { createCompany } from "@/data/companies.repository";
import type { CompanyListParams } from "@/schemas/companies.schema";

export function CompanyCreateDialog({
    isCreateOpen,
    setIsCreateOpen,
    creating,
    setCreating,
    setParams,
}: {
    isCreateOpen: boolean;
    setIsCreateOpen: (open: boolean) => void;
    creating: boolean;
    setCreating: (creating: boolean) => void;
    setParams: React.Dispatch<React.SetStateAction<CompanyListParams>>;
}) {
    return (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild />
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Créer une entreprise</DialogTitle>
                </DialogHeader>
                <CompanyForm
                    loading={creating}
                    onSubmit={async (values) => {
                        try {
                            setCreating(true);
                            await createCompany(values);
                            toast.success("Entreprise créée avec succès");
                            setParams((prev) => ({
                                ...prev,
                                page: 1,
                            }));
                            setIsCreateOpen(false);
                        } catch (error) {
                            console.error(error, values);
                            toast.error("Erreur lors de la création de l'entreprise");
                        } finally {
                            setCreating(false);
                        }
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}