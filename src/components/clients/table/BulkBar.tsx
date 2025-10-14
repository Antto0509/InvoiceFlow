"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function BulkBar({
  count,
  onBulkDelete,
  onOpenBulkEdit,
}: {
  count: number;
  onBulkDelete: () => void;
  onOpenBulkEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2">
      <span className="text-sm">{count} sélectionné(s)</span>

      {/* ⚠️ Confirmation avant suppression en lot */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">Supprimer</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer les éléments sélectionnés ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible et supprimera {count} client(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onBulkDelete}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button variant="secondary" size="sm" onClick={onOpenBulkEdit}>
        Éditer en lot
      </Button>
    </div>
  );
}
