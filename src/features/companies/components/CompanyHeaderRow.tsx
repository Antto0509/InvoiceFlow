import * as React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Company } from "@/schemas/companies.schema";

export default function CompanyHeaderRow({
  company,
  onEdit,
  onDelete,
}: {
  company: Company;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">{company.name}</h2>
        <p className="text-sm text-muted-foreground">
          {company.legal_form ?? "Forme inconnue"} · SIREN {company.siren ?? "—"} · SIRET {company.siret ?? "—"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onEdit}>
          <Pencil className="w-4 h-4 mr-2" />
          Modifier
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer
        </Button>
      </div>
    </div>
  );
}