"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SortDir = "asc" | "desc";
type ThProps<TCol extends string = string> = {
  label: string;
  column: TCol;                 // ex: "name" | "email" | "created_at"
  sortKey?: TCol | string;
  sortDir?: SortDir;
  onSort: (col: TCol) => void;
  className?: string;
  align?: "left" | "center" | "right";
};

export function Th<TCol extends string = string>({
  label,
  column,
  sortKey,
  sortDir = "asc",
  onSort,
  className,
  align = "left",
}: ThProps<TCol>) {
  const isActive = sortKey === column;
  return (
    <th
      className={cn(
        "p-3 select-none cursor-pointer align-middle",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
        className
      )}
      onClick={() => onSort(column)}
      aria-sort={isActive ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      title={`Trier par ${label}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (sortDir === "asc" ? "▲" : "▼") : ""}
      </span>
    </th>
  );
}
