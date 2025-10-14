import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <div className="text-xs text-muted-foreground">
        {start}–{end} sur {total}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Précédent
        </Button>
        <span className="text-sm">
          Page {page} / {maxPage}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.min(maxPage, page + 1))}
          disabled={page >= maxPage}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
