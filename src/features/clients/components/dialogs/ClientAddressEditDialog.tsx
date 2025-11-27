"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientAddressForm } from "../forms/ClientAddressForm";
import { updateClientAddress } from "@/data/clients.repository";
import type { ClientAddressFormValues, ClientAddressEditProps } from "@/schemas/clients.schema";

/**
 * Composant de dialogue de modification d’adresse client
 * @param param0 Props spécifiques au dialogue de modification d’adresse client
 * @returns Composant de dialogue de modification d’adresse client
 */
export function ClientAddressEditDialog({
    editClientAddress,
    setEditClientAddress,
    updating,
    setUpdating,
    setParams,
}: ClientAddressEditProps) {
    const loading = !!updating;

    return (
        <Dialog open={!!editClientAddress} onOpenChange={(o) => { if (!o) setEditClientAddress(null); }}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Modifier l’adresse du client</DialogTitle>
                </DialogHeader>
                {editClientAddress && (
                    <ClientAddressForm
                        loading={loading}
                        defaultValues={{
                            ...(editClientAddress as unknown as Partial<ClientAddressFormValues>),
                        }}
                        onSubmit={async (values) => {
                            try {
                                setUpdating?.(true);
                                if (!editClientAddress?.id) return;
                                await updateClientAddress(editClientAddress.id, values);
                                toast.success("Adresse client mise à jour");
                                setEditClientAddress(null);
                                setParams?.((p) => ({ ...p }));
                            } catch (e) {
                                console.error(e);
                                toast.error("Erreur lors de la mise à jour de l’adresse");
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