"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  createCompanyBankAccount,
  updateCompanyBankAccount,
  removeCompanyBankAccount,
} from "@/data/companies.repository";
import type { CompanyBankAccount, CompanyListParams } from "@/schemas/companies.schema";
import { CompanyBankAccountsForm } from "../forms/CompanyBankAccountsForm";

export function CompanyBankAccountsDialog({
  companyId,
  editCompanyBankAccounts,
  setEditCompanyBankAccounts,
  updating,
  setUpdating,
  setParams,
}: {
  companyId: string;
  editCompanyBankAccounts: CompanyBankAccount[] | null;
  setEditCompanyBankAccounts: (bankAccounts: CompanyBankAccount[] | null) => void;
  updating?: boolean;
  setUpdating?: (v: boolean) => void;
  setParams?: React.Dispatch<React.SetStateAction<CompanyListParams>>;
}) {
  const loading = !!updating;

  // on garde une copie de départ pour savoir quoi supprimer
  const initialAccountsRef = React.useRef<CompanyBankAccount[] | null>(null);

  React.useEffect(() => {
    if (editCompanyBankAccounts) {
      // on clone pour éviter les mutations
      initialAccountsRef.current = structuredClone(editCompanyBankAccounts);
    } else {
      initialAccountsRef.current = null;
    }
  }, [editCompanyBankAccounts]);

  return (
    <Dialog
      open={!!editCompanyBankAccounts}
      onOpenChange={(o) => {
        if (!o) setEditCompanyBankAccounts(null);
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier les comptes bancaires de la société</DialogTitle>
        </DialogHeader>

        {editCompanyBankAccounts && (
          <CompanyBankAccountsForm
            companyId={companyId}
            defaultAccounts={editCompanyBankAccounts}
            loading={loading}
            onSubmit={async (values) => {
              try {
                setUpdating?.(true);

                const initial = initialAccountsRef.current ?? [];
                const final = values.bank_accounts;

                // 1. indexer les comptes initiaux par id
                const initialById = new Map<string, CompanyBankAccount>();
                for (const acc of initial) {
                  if (acc.id) initialById.set(acc.id, acc);
                }

                // 2. traiter tous les comptes du formulaire
                for (const acc of final) {
                  // nouveau compte → pas d'id
                  if (!acc.id) {
                    await createCompanyBankAccount({
                      ...acc,
                      company_id: companyId,
                    });
                    continue;
                  }

                  // compte existant → update
                  await updateCompanyBankAccount(acc.id, {
                    ...acc,
                    company_id: companyId,
                  });

                  // on enlève de la map pour savoir lesquels restent à supprimer
                  initialById.delete(acc.id);
                }

                // 3. tout ce qu'il reste dans initialById = supprimé par l'utilisateur
                for (const [id] of initialById) {
                  await removeCompanyBankAccount(id);
                }

                toast.success("Comptes bancaires de la société mis à jour");
                setEditCompanyBankAccounts(null);
                // refresh liste
                setParams?.((p) => ({ ...p }));
              } catch (err) {
                console.error(err);
                toast.error("Erreur lors de la mise à jour des comptes bancaires de la société");
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
