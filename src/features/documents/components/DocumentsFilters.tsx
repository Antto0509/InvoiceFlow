"use client";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentKind, DocumentStatus } from "../schemas/documents.schema";
import { DOC_STATUS_BY_KIND, labelDocStatus } from "@/lib/utils";

/**
 * Filtre les factures par statut.
 */
export function DocumentsFilters({
  kind,
  status,
  onStatusChange,
}: {
  kind: DocumentKind;
  status: DocumentStatus | "all";
  onStatusChange: (s: DocumentStatus | "all") => void;
}) {
  // Liste des statuts valides pour ce type de document
  const statusOptions = React.useMemo(
    () => Object.keys(DOC_STATUS_BY_KIND[kind] ?? {}) as DocumentStatus[],
    [kind]
  );

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        onValueChange={(v) => onStatusChange(v as DocumentStatus | "all")}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>

          {statusOptions.map((s) => (
            <SelectItem key={s} value={s}>
              {labelDocStatus(kind, s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
