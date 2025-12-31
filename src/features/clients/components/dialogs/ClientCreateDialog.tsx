"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClientForm } from "../forms/ClientForm";
import { createClient } from "@/data/clients.repository";
import type { ClientCreateProps } from "@/schemas/clients.schema";

/**
 * Composant de dialogue de création de client
 * @param param0 Props spécifiques au dialogue de création de client
 * @returns Composant de dialogue de création de client
 */
export function ClientCreateDialog({
    isCreateOpen,
    setIsCreateOpen,
    creating,
    setCreating,
    setParams,
}: ClientCreateProps) {
    return (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild />
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Créer un client</DialogTitle>
                </DialogHeader>
                <ClientForm
                    loading={creating}
                    onSubmit={async (values) => {
                        console.log("Creating client with values:", values);
                        try {
                            setCreating(true);
                            await createClient(values);
                            toast.success("Client créé");
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