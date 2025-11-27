"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClientAddressForm } from "../forms/ClientAddressForm";
import { createClientAddress } from "@/data/clients.repository";
import type { ClientAddressCreateProps } from "@/schemas/clients.schema";

/**
 * Composant de dialogue de création d’adresse client
 * @param param0 Props spécifiques au dialogue de création d’adresse client
 * @returns Composant de dialogue de création d’adresse client
 */
export function ClientAddressCreateDialog({
    isCreateOpen,
    setIsCreateOpen,
    creating,
    setCreating,
    setParams,
}: ClientAddressCreateProps) {
    return (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild />
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Créer une adresse client</DialogTitle>
                </DialogHeader>
                <ClientAddressForm
                    loading={creating}
                    onSubmit={async (values) => {
                        try {
                            setCreating(true);
                            await createClientAddress(values);
                            toast.success("Adresse client créée");
                            setIsCreateOpen(false);
                            // refresh list
                            setParams((p) => ({ ...p }));
                        } catch (e) {
                            console.error(e);
                            toast.error("Erreur lors de la création");
                        }
                        finally {
                            setCreating(false);
                        }
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}