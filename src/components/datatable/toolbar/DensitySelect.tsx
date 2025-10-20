"use client";
import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

export function DensitySelect({
  value,
  onChange,
  className,
}: {
  value: "normal" | "dense";
  onChange: (v: "normal" | "dense") => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as "normal" | "dense")}>
      <SelectTrigger className={className ?? "w-[120px]"}>Densité</SelectTrigger>
      <SelectContent>
        <SelectItem value="normal">Normale</SelectItem>
        <SelectItem value="dense">Dense</SelectItem>
      </SelectContent>
    </Select>
  );
}
