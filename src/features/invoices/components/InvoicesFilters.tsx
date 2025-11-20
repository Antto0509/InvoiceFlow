"use client";
import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentStatus } from "../schemas/documents.schema";

/**
 * Filtre les factures par statut.
 * @param param0 Props du composant
 * @returns Composant InvoicesFilters
 */
export function InvoicesFilters({
  status,
  onStatusChange,
}: {
  status: DocumentStatus | "all";
  onStatusChange: (s: DocumentStatus | "all") => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={(v: DocumentStatus | "all") => onStatusChange(v)}>
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Statut" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          <SelectItem value="draft">Brouillon</SelectItem>
          <SelectItem value="sent">Envoyée</SelectItem>
          <SelectItem value="accepted">Acceptée</SelectItem>
          <SelectItem value="declined">Refusée</SelectItem>
          <SelectItem value="expired">Expirée</SelectItem>
          <SelectItem value="paid">Payée</SelectItem>
          <SelectItem value="overdue">En retard</SelectItem>
          <SelectItem value="void">Annulée</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
