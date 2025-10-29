export default function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-48 shrink-0 text-muted-foreground">{label}</div>
      <div className="flex-1">{value ?? "—"}</div>
    </div>
  );
}