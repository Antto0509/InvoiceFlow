"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ClientsToolbar({
  query, onQuery,
  onOpenCreate, onOpenBulkAdd,
  sortKey, sortDir, onSortKeyChange, onSortDirChange,
  pageSize, onPageSizeChange,
  onExportPage, onExportAll,
}: {
  query: string;
  onQuery: (v: string) => void;
  onOpenCreate: () => void;
  onOpenBulkAdd: () => void;
  sortKey: string;
  sortDir: "asc" | "desc";
  onSortKeyChange: (k: "name" | "email" | "company" | "created_at") => void;
  onSortDirChange: (d: "asc" | "desc") => void;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
  onExportPage: () => void;
  onExportAll: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          className="max-w-md"
        />

        <select
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={sortKey}
          onChange={(e) => onSortKeyChange(e.target.value as "name" | "email" | "company" | "created_at")}
        >
          <option value="created_at">Créé le</option>
          <option value="name">Nom</option>
          <option value="email">Email</option>
          <option value="company">Société</option>
        </select>

        <select
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={sortDir}
          onChange={(e) => onSortDirChange(e.target.value as "asc" | "desc")}
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>

        <select
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onExportPage}>Exporter (page)</Button>
        <Button variant="outline" onClick={onExportAll}>Exporter (tout)</Button>
        <Button variant="secondary" onClick={onOpenBulkAdd}>Ajouter en lot</Button>
        <Button onClick={onOpenCreate}>Nouveau client</Button>
      </div>
    </div>
  );
}
