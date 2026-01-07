import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClientContactForm } from "../forms/ClientContactForm";
import { createClientContact } from "@/data/clients.repository";
import type { ClientContactCreateProps } from "@/schemas/clients.schema";

/**
 * Composant de dialogue de création de contact client
 * @param param0 Props spécifiques au dialogue de création de contact client
 * @return Composant de dialogue de création de contact client
 */
export function ClientContactCreateDialog({
    isCreateOpen,
    setIsCreateOpen,
    creating,
    setCreating,
    setParams,
}: ClientContactCreateProps) {
    return (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild />
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Créer un contact client</DialogTitle>
                </DialogHeader>
                <ClientContactForm
                    loading={creating}
                    onSubmit={async (values) => {
                        try {
                            setCreating(true);
                            await createClientContact(values);
                            toast.success("Contact client créé");
                            setIsCreateOpen(false);
                            // refresh list
                            setParams((p) => ({ ...p }));
                        } catch (e) {
                            console.error(e);
                            toast.error("Erreur lors de la création");
                        } finally {
                            setCreating(false);
                        }
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}