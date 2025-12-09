import { Card } from "@/components/ui/card";

export default function EmptySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="h-48 animate-pulse bg-muted/30" />
      ))}
    </div>
  );
}