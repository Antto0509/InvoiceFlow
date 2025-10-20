"use client";
import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

export function SortSelect({
  sortKey,
  sortDir,
  onSortKeyChange,
  onSortDirChange,
  fields,
  className,
}: {
  sortKey: string;
  sortDir: "asc" | "desc";
  onSortKeyChange: (v: string) => void;
  onSortDirChange: (v: "asc" | "desc") => void;
  /** liste des champs triables: [{value:"name", label:"Nom"}] */
  fields: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex gap-2">
        <Select value={sortKey} onValueChange={onSortKeyChange}>
          <SelectTrigger className="w-[160px]">Trier par</SelectTrigger>
          <SelectContent>
            {fields.map(f => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortDir} onValueChange={(v) => onSortDirChange(v as "asc" | "desc")}>
          <SelectTrigger className="w-[120px]">Ordre</SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascendant</SelectItem>
            <SelectItem value="desc">Descendant</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
