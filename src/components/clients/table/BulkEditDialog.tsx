"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function BulkEditDialog({
  open,
  onOpenChange,
  onConfirm,
  selectedCount,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (patch: { company?: string; phone?: string; notes?: string }) => void;
  selectedCount: number;
}) {
  const [patch, setPatch] = React.useState<{ company?: string; phone?: string; notes?: string }>({});

  function canApply() {
    return [patch.company, patch.phone, patch.notes].some((v) => (v ?? "") !== "");
  }

  function confirm() {
    onConfirm(patch);
    setPatch({});
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Éditer en lot</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <Input
            placeholder="Société (laisser vide pour ne pas changer)"
            value={patch.company ?? ""}
            onChange={(e) => setPatch((p) => ({ ...p, company: e.target.value }))}
          />
          <Input
            placeholder="Téléphone (laisser vide pour ne pas changer)"
            value={patch.phone ?? ""}
            onChange={(e) => setPatch((p) => ({ ...p, phone: e.target.value }))}
          />
          <Input
            placeholder="Notes (laisser vide pour ne pas changer)"
            value={patch.notes ?? ""}
            onChange={(e) => setPatch((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>

          {/* ⚠️ Confirmation avant d’appliquer */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={!canApply()}>Prévisualiser & Confirmer</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer l’édition en lot</AlertDialogTitle>
                <AlertDialogDescription>
                  Vous allez modifier <strong>{selectedCount}</strong> client(s).
                  Seuls les champs non vides seront appliqués.
                  Continuer ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={confirm}>Confirmer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
