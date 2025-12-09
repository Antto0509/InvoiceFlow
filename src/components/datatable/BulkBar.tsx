"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type BulkBarProps = {
  /** Nombre d'éléments sélectionnés */
  count: number;
  /** Callback de suppression en lot */
  onBulkDelete: () => void;
  /** Ouvre la modale d'édition en lot */
  onOpenBulkEdit: () => void;
  /** Libellé entité (ex: "client", "facture") pour l’UX */
  entityLabel?: string; // défaut: "élément"
  /** Personnalisation du texte de confirmation */
  confirmTitle?: string;
  confirmDescription?: string;
  /** Désactiver les boutons (ex: en chargement) */
  disabled?: boolean;
};

export function BulkBar({
  count,
  onBulkDelete,
  onOpenBulkEdit,
  entityLabel = "élément",
  confirmTitle,
  confirmDescription,
  disabled,
}: BulkBarProps) {
  const labelPlural = count > 1 ? `${entityLabel}s` : entityLabel;

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2">
      <span className="text-sm">
        {count} sélectionné{count > 1 ? "s" : ""} {/* ex: "3 sélectionnés" */}
      </span>

      {/* Confirmation avant suppression en lot */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={disabled}>
            Supprimer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmTitle ?? `Supprimer les ${labelPlural} sélectionné${count > 1 ? "s" : ""} ?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDescription ?? (
                <>Cette action est irréversible et supprimera {count} {labelPlural}.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onBulkDelete}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button variant="secondary" size="sm" onClick={onOpenBulkEdit} disabled={disabled}>
        Éditer en lot
      </Button>
    </div>
  );
}
