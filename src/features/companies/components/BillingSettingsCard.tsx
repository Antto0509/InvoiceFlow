import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { Company } from "@/schemas/companies.schema";
import Row from "./Row";
import { fmtVatRegime } from "@/lib/utils";

export default function BillingSettingsCard({ company, onEdit }: { company: Company; onEdit: () => void }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Facturation</CardTitle>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4 mr-1" /> Éditer
        </Button>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <Row label="Devise" value={company.default_currency} />
        <Row label="Régime TVA" value={fmtVatRegime(company.vat_regime)} />
        <Row label="Conditions de paiement" value={company.payment_terms} />
        <Row label="Taux pénalités retard" value={company.penalty_rate != null ? `${company.penalty_rate}%` : undefined} />
        <Row label="Indemnité recouvrement" value={company.recovery_fee_enabled ? "Affichée (40 €)" : "Non"} />
      </CardContent>
    </Card>
  );
}
