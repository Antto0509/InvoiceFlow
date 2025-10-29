import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { Company } from "@/schemas/companies.schema";
import Row from "./Row";

export function ContactBrandingCard({ company, onEdit }: { company: Company; onEdit: () => void }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contact & Branding</CardTitle>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4 mr-1" /> Éditer
        </Button>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <Row label="Site" value={company.website} />
        <Row label="Email" value={company.email} />
        <Row label="Téléphone" value={company.phone} />
        <Row label="Logo" value={company.logo_url} />
      </CardContent>
    </Card>
  );
}