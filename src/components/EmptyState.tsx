import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyState({ onCreate, text, label }: { onCreate: () => void; text: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <Building2 className="w-10 h-10 text-muted-foreground mb-3" />
      <p className="text-muted-foreground mb-6">
        {text}
      </p>
      <Button onClick={onCreate}>
        <Plus className="w-4 h-4 mr-2" />
        {label}
      </Button>
    </div>
  );
}