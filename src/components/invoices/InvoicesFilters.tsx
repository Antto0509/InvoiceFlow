"use client";
import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function InvoicesFilters({
  status,
  onStatusChange,
}: {
  status: "all" | "draft" | "sent" | "paid" | "overdue";
  onStatusChange: (s: "all" | "draft" | "sent" | "paid" | "overdue") => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={(v: "all" | "draft" | "sent" | "paid" | "overdue") => onStatusChange(v)}>
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Statut" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          <SelectItem value="draft">Brouillon</SelectItem>
          <SelectItem value="sent">Envoyée</SelectItem>
          <SelectItem value="paid">Payée</SelectItem>
          <SelectItem value="overdue">En retard</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
