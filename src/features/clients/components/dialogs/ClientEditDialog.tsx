"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientForm } from "../forms/ClientForm";
import { updateClient } from "@/data/clients.repository";
import type { ClientFormValues, ClientEditProps } from "@/schemas/clients.schema";

/**
 * Composant de dialogue de modification de client
 * @param param0 Props spécifiques au dialogue de modification de client
 * @returns Composant de dialogue de modification de client
 */
export function ClientEditDialog({
  editClient,
  setEditClient,
  updating,
  setUpdating,
  setParams,
}: ClientEditProps) {
  const loading = !!updating;

  return (
    <Dialog open={!!editClient} onOpenChange={(o) => { if (!o) setEditClient(null); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
        </DialogHeader>
        {editClient && (
          <ClientForm
            loading={loading}
            defaultValues={{
              ...(editClient as unknown as Partial<ClientFormValues>),
              email: editClient.email ?? undefined,
              phone: editClient.phone ?? undefined,
              address: editClient.address ?? undefined,
            }}
            onSubmit={async (values) => {
              try {
                setUpdating?.(true);
                if (!editClient?.id) return;
                await updateClient(editClient.id, values);
                toast.success("Client mis à jour");
                setEditClient(null);
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