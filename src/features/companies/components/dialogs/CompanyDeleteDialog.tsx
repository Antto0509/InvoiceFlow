"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { removeCompany } from "@/data/companies.repository";
import type { Company, CompanyListParams } from "@/schemas/companies.schema";

export function CompanyDeleteDialog({
  deleteCompany,
  setDeleteCompany,
    setParams, 
}: {
  deleteCompany: Company | null;
  setDeleteCompany: (company: Company | null) => void;
  setParams: React.Dispatch<React.SetStateAction<CompanyListParams>>;
}) {
    const handleConfirm = async () => {
        if (!deleteCompany?.id) return;
        try {
            await removeCompany(deleteCompany.id);
            toast.success("Société supprimée");
            setDeleteCompany(null);
            setParams((p) => ({ ...p }));
        } catch (e) {
            console.error(e);
            toast.error("Erreur lors de la suppression");
        }
    };
    return (
        <AlertDialog open={!!deleteCompany} onOpenChange={(o) => { if (!o) setDeleteCompany(null); }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Supprimer {deleteCompany?.name ? `la société « ${deleteCompany.name} »` : "cette société"} ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteCompany(null)}>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>Supprimer</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}