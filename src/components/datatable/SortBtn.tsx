import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InvoiceSort } from "@/schemas/invoices.schema";
import type { ClientSort } from "@/schemas/clients.schema";

export function SortBtn({ col, sort, onSortChange }: {
  col: InvoiceSort["column"] | ClientSort["column"];
  sort: InvoiceSort | ClientSort;
  onSortChange: (s: InvoiceSort | ClientSort) => void;
}) {
  return (
    <Button
      variant="ghost"
      className="-ml-2 h-8 px-2"
      onClick={() => {
        const dir = sort?.column === col && sort?.dir === "asc" ? "desc" : "asc";
        onSortChange?.({ column: col, dir });
      }}
    >
      <ArrowUpDown className="h-4 w-4" />
    </Button>
  );
}
