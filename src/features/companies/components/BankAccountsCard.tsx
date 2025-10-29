import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import type { CompanyWithDetails } from "@/schemas/companies.schema";

export default function BankAccountsCard({ details }: { details?: CompanyWithDetails }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          <CardTitle>Comptes bancaires</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {details?.bank_accounts?.length ? (
          details.bank_accounts.map((b) => (
            <div key={b.id} className="rounded-lg border p-3 text-sm">
              <div className="font-medium">{b.label}</div>
              <div className="text-muted-foreground">
                IBAN: {b.iban} {b.bic ? `· BIC: ${b.bic}` : ""} {b.display ? "· (affiché)" : ""}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Aucun compte bancaire.</p>
        )}
      </CardContent>
    </Card>
  );
}