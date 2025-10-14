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
import { Client } from "@/schemas/clients";
import { toast } from "sonner";
import { safeParseCsv, MIN_HEADERS } from "@/lib/clients/csv";

export function BulkAddDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (rows: Array<Partial<Client>>) => Promise<void> | void;
}) {
  const [raw, setRaw] = React.useState("");
  const [parsedCount, setParsedCount] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [headerInfo, setHeaderInfo] = React.useState<"minimal" | "full" | "invalid" | null>(null);
  const [headerError, setHeaderError] = React.useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setRaw(text);
    analyze(text);
  }

  function analyze(text: string) {
    const { rows, headerType, error } = safeParseCsv(text);
    setParsedCount(rows.length);
    setHeaderInfo(headerType);
    setHeaderError(error);
  }

  function onRawChange(val: string) {
    setRaw(val);
    analyze(val);
  }

  async function handleConfirm() {
    const { rows, headerType, error } = safeParseCsv(raw);
    if (error || headerType === "invalid") {
      toast.error(error || "En-têtes CSV invalides.");
      return;
    }
    setBusy(true);
    await onSubmit(rows);
    setBusy(false);
    setRaw("");
    setParsedCount(0);
    setHeaderInfo(null);
    setHeaderError(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setRaw(""); setParsedCount(0); setHeaderInfo(null); setHeaderError(null); } }}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Ajout en lot (CSV)</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Importer un fichier CSV</label>
          <Input type="file" accept=".csv,text/csv" onChange={onFile} />
          <p className="text-xs text-muted-foreground">
            En-têtes attendues : <code>{MIN_HEADERS.join(",")}</code>
          </p>
          {headerInfo === "full" && (
            <p className="text-xs text-amber-600">
              En-têtes complètes détectées (export). Les colonnes supplémentaires seront ignorées.
            </p>
          )}
          {headerError && (
            <p className="text-xs text-red-600">{headerError}</p>
          )}
          {parsedCount > 0 && (
            <p className="text-xs">Aperçu : {parsedCount} ligne(s) détectée(s).</p>
          )}
        </div>

        <div className="grid gap-2 pt-4">
          <label className="text-sm font-medium">Ou coller votre CSV</label>
          <textarea
            className="min-h-[200px] w-full rounded-md border p-2 text-sm"
            placeholder={`name,email,company,phone,address,notes
Alice,a@ex.com,Acme,0600000000,10 rue X,VIP`}
            value={raw}
            onChange={(e) => onRawChange(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          {/* ⚠️ Confirmation avant d’ajouter */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={busy || parsedCount === 0 || headerInfo === "invalid"}>
                {busy ? "Ajout..." : "Ajouter"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer l’ajout en lot</AlertDialogTitle>
                <AlertDialogDescription>
                  Les clients du CSV seront ajoutés à votre compte.<br />
                  {headerInfo === "full"
                    ? "Colonnes supplémentaires ignorées (id/created_at/updated_at)."
                    : "Vérifiez les doublons éventuels avant de continuer."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirm}>Confirmer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
