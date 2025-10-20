"use client";
import { Button } from "@/components/ui/button";

export function Pagination({ page, pageSize, total, onPageChange }: {
  page: number; pageSize: number; total: number; onPageChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between py-2">
      <div className="text-sm text-muted-foreground">{total} éléments • page {page}/{pages}</div>
      <div className="flex gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Précédent</Button>
        <Button variant="outline" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Suivant</Button>
      </div>
    </div>
  );
}
