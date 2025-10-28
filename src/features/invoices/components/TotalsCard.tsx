"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/utils";

export function TotalsCard({
  subtotal,
  tax,
  total,
  currency,
  taxRate = 0.2,
  className,
}: {
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  taxRate?: number; // 0.2 = 20%
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="p-4">
        <CardTitle className="text-base">Récapitulatif</CardTitle>
        <CardDescription>Montants calculés automatiquement</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span className="font-medium tabular-nums">{formatMoney(subtotal || 0, currency)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">TVA ({Math.round(taxRate * 100)}%)</span>
          <span className="font-medium tabular-nums">{formatMoney(tax || 0, currency)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex items-center justify-between text-lg">
          <span className="font-semibold">Total</span>
          <span className="font-semibold tabular-nums">{formatMoney(total || 0, currency)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
