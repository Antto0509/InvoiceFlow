import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { CompanyWithDetails } from "@/schemas/companies.schema";
import { labelAddressKind } from "@/lib/utils";

export default function AddressesCard({ details }: { details?: CompanyWithDetails }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <CardTitle>Adresses</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {details?.addresses?.length ? (
          details.addresses.map((a) => (
            <div key={a.id} className="rounded-lg border p-3 text-sm">
              <div className="font-medium">{labelAddressKind(a.kind)}</div>
              <div className="text-muted-foreground">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""} — {a.postal_code ?? ""} {a.city ?? ""} ({a.country})
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Aucune adresse.</p>
        )}
      </CardContent>
    </Card>
  );
}