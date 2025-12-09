"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientContactForm } from "../forms/ClientContactForm";
import { updateClientContact } from "@/data/clients.repository";
import type { ClientContactFormValues, ClientContactEditProps } from "@/schemas/clients.schema";

/**
 * Composant de dialogue de modification de contact client
 * @param param0 Props spécifiques au dialogue de modification de contact client
 * @returns Composant de dialogue de modification de contact client
 */
export function ClientContactEditDialog({
    editClientContact,
    setEditClientContact,
    updating,
    setUpdating,
    setParams,
}: ClientContactEditProps) {
    const loading = !!updating;

    return (
        <Dialog open={!!editClientContact} onOpenChange={(o) => { if (!o) setEditClientContact(null); }}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Modifier le contact du client</DialogTitle>
                </DialogHeader>
                {editClientContact && (
                    <ClientContactForm
                        loading={loading}
                        defaultValues={{
                            ...(editClientContact as unknown as Partial<ClientContactFormValues>),
                        }}
                        onSubmit={async (values) => {
                            try {
                                setUpdating?.(true);
                                if (!editClientContact?.id) return;
                                await updateClientContact(editClientContact.id, values);
                                toast.success("Contact client mis à jour");
                                setEditClientContact(null);
                                setParams?.((p) => ({ ...p }));
                            } catch (e) {
                                console.error(e);
                                toast.error("Erreur lors de la mise à jour du contact");
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