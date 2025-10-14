"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Th({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
  className,
}: {
  label: string;
  column: "name" | "email" | "company" | "created_at";
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (col: string) => void;
  className?: string;
}) {
  const isActive = sortKey === column;
  return (
    <th
      className={cn(
        "text-left p-3 select-none cursor-pointer align-middle",
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
