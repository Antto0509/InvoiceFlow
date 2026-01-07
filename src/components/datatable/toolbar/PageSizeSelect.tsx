"use client";
import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

export function PageSizeSelect({
  pageSize,
  onChange,
  options = [10, 20, 50, 100],
  className,
}: {
  pageSize: number;
  onChange: (n: number) => void;
  options?: number[];
  className?: string;
}) {
  return (
    <Select value={String(pageSize)} onValueChange={(v) => onChange(parseInt(v, 10))}>
      <SelectTrigger className={className ?? "w-[120px]"}>Par page</SelectTrigger>
      <SelectContent>
        {options.map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
