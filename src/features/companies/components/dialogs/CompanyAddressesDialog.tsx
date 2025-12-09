"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  createCompanyAddress,
  updateCompanyAddress,
  removeCompanyAddress,
} from "@/data/companies.repository";
import type { CompanyAddress, CompanyListParams } from "@/schemas/companies.schema";
import { CompanyAddressesForm } from "../forms/CompanyAddressesForm";

export function CompanyAddressesDialog({
  companyId,
  editCompanyAddresses,
  setEditCompanyAddresses,
  updating,
  setUpdating,
  setParams,
}: {
  companyId: string;
  editCompanyAddresses: CompanyAddress[] | null;
  setEditCompanyAddresses: (addresses: CompanyAddress[] | null) => void;
  updating?: boolean;
  setUpdating?: (v: boolean) => void;
  setParams?: React.Dispatch<React.SetStateAction<CompanyListParams>>;
}) {
  const loading = !!updating;

  // on garde en mémoire la version "avant modif" pour pouvoir diff
  const initialAddressesRef = React.useRef<CompanyAddress[] | null>(null);
  React.useEffect(() => {
    if (editCompanyAddresses) {
      // on clone pour ne pas muter
      initialAddressesRef.current = structuredClone(editCompanyAddresses);
    } else {
      initialAddressesRef.current = null;
    }
  }, [editCompanyAddresses]);

  return (
    <Dialog open={!!editCompanyAddresses} onOpenChange={(o) => { if (!o) setEditCompanyAddresses(null); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier les adresses de la société</DialogTitle>
        </DialogHeader>

        {editCompanyAddresses && (
          <CompanyAddressesForm
            companyId={companyId}
            defaultAddresses={editCompanyAddresses}
            onSubmit={async (values) => {
              try {
                setUpdating?.(true);

                const initial = initialAddressesRef.current ?? [];
                const final = values.addresses;

                // 1. indexer les initiales par id
                const initialById = new Map<string, CompanyAddress>();
                for (const addr of initial) {
                  if (addr.id) initialById.set(addr.id, addr);
                }

                // 2. traiter toutes les adresses finales
                for (const addr of final) {
                  // nouvelle adresse (pas d'id) -> create
                  if (!addr.id) {
                    await createCompanyAddress({
                      ...addr,
                      company_id: companyId,
                    });
                    continue;
                  }

                  // adresse existante -> update
                  await updateCompanyAddress(addr.id, {
                    ...addr,
                    company_id: companyId,
                  });

                  // on la retire de la map, comme ça ce qui reste à la fin = à supprimer
                  initialById.delete(addr.id);
                }

                // 3. ce qu'il reste dans initialById = adresses supprimées dans le formulaire
                for (const [id] of initialById) {
                  await removeCompanyAddress(id);
                }

                toast.success("Adresses de la société mises à jour");
                setEditCompanyAddresses(null);
                // pour rafraîchir ta liste de sociétés
                setParams?.((p) => ({ ...p }));
              } catch (err) {
                console.error(err);
                toast.error("Erreur lors de la mise à jour des adresses de la société");
              } finally {
                setUpdating?.(false);
              }
            }}
            loading={loading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
