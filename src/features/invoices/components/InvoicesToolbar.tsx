"use client";

import * as React from "react";
import { DataToolbar } from "@/components/datatable/DataToolbar";
import { DateRangePicker } from "@/components/datatable/toolbar/DateRangePicker";
import { SelectClient } from "@/components/datatable/SelectClient";
import { SortSelect } from "@/components/datatable/toolbar/SortSelect";
import { PageSizeSelect } from "@/components/datatable/toolbar/PageSizeSelect";

export function InvoicesToolbar({
  search,
  onSearch,
  range,
  onRange,
  clientId,
  onClientId,
  // optionnel : si tu veux exposer tri et pagination directement dans la toolbar des factures
  sortKey,
  sortDir,
  onSortKeyChange,
  onSortDirChange,
  pageSize,
  onPageSizeChange,
  placeholder = "Rechercher (n° ou client)…",
}: {
  search: string;
  onSearch: (v: string) => void;
  range?: { from?: string; to?: string };
  onRange: (r?: { from?: string; to?: string }) => void;
  clientId?: string;
  onClientId: (id?: string) => void;

  sortKey?: "issue_date" | "number" | "total" | "status";
  sortDir?: "asc" | "desc";
  onSortKeyChange?: (v: "issue_date" | "number" | "total" | "status") => void;
  onSortDirChange?: (v: "asc" | "desc") => void;
  pageSize?: number;
  onPageSizeChange?: (n: number) => void;

  placeholder?: string;
}) {
  return (
    <DataToolbar
      search={search}
      onSearch={onSearch}
      placeholder={placeholder}
      right={
        <div className="flex flex-wrap items-center gap-2">
          <SelectClient value={clientId} onChange={onClientId} />
          <DateRangePicker value={range} onChange={onRange} placeholder="Période" />

          {/* Ces contrôles sont optionnels ; n’affiche que si on passe les props */}
          {onSortKeyChange && onSortDirChange && sortKey && sortDir && (
            <SortSelect
              sortKey={sortKey}
              sortDir={sortDir}
              onSortKeyChange={(v) =>
                onSortKeyChange(v as "issue_date" | "number" | "total" | "status")
              }
              onSortDirChange={onSortDirChange}
              fields={[
                { value: "issue_date", label: "Émission" },
                { value: "number", label: "N°" },
                { value: "total", label: "Montant" },
                { value: "status", label: "Statut" },
              ]}
            />
          )}

          {onPageSizeChange && typeof pageSize === "number" && (
            <PageSizeSelect pageSize={pageSize} onChange={onPageSizeChange} />
          )}
        </div>
      }
    />
  );
}
