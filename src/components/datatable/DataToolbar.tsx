"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DataToolbar({
  search,
  onSearch,
  placeholder = "Rechercher…",
  left,
  right,
  className,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-center gap-2">
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-64"
        />
        {left}
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}
