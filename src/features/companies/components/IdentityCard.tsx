import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { Company } from "@/schemas/companies.schema";
import Row from "./Row";

export default function IdentityCard({ company, onEdit }: { company: Company; onEdit: () => void }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Identité</CardTitle>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4 mr-1" /> Éditer
        </Button>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <Row label="Forme juridique" value={company.legal_form} />
        <Row label="RCS" value={company.rcs_city} />
        <Row label="APE/NAF" value={company.ape_naf} />
        <Row label="Capital social" value={company.share_capital} />
        <Row label="TVA intracom." value={company.vat_number} />
      </CardContent>
    </Card>
  );
}