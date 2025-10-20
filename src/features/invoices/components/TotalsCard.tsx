"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span className="font-medium">{formatMoney(subtotal || 0, currency)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">TVA ({Math.round(taxRate * 100)}%)</span>
          <span className="font-medium">{formatMoney(tax || 0, currency)}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-base">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">{formatMoney(total || 0, currency)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
