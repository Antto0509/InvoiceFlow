"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClientForm } from "../ClientForm";
import { createClient } from "@/data/clients.repository";
import type { ClientListParams } from "@/schemas/clients.schema";

export function ClientCreateDialog({
    isCreateOpen,
    setIsCreateOpen,
    creating,
    setCreating,
    setParams,
}: {
    isCreateOpen: boolean;
    setIsCreateOpen: (open: boolean) => void;
    creating: boolean;
    setCreating: (v: boolean) => void;
    setParams: React.Dispatch<React.SetStateAction<ClientListParams>>;
}) {
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