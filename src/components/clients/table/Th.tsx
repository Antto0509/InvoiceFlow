export function Th({
    label,
    column,
    sortKey,
    sortDir,
    onSort,
}: {
  label: string;
  column: "name" | "email" | "company" | "created_at";
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (col: string) => void;
}) {
  const isActive = sortKey === column;
  return (
    <th
      className="text-left p-3 select-none cursor-pointer"
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