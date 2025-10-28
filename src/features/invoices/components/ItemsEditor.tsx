"use client";

import * as React from "react";
import { useWatch } from "react-hook-form";
import { useFieldArray, useFormContext, type Path } from "react-hook-form";
import { Plus, Trash } from "lucide-react";
import { InvoiceFormValues } from "@/schemas/invoices.schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatMoney } from "@/lib/utils";
import { TotalsCard } from "./TotalsCard";
import { DEFAULT_TAX_RATE } from "@/lib/constants";

export function ItemsEditor({
  currency,
  taxRate = DEFAULT_TAX_RATE,
  invoiceId,
  className,
}: {
  currency: string;
  taxRate?: number;
  invoiceId: string;
  className?: string;
}) {
  const form = useFormContext<InvoiceFormValues>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  const subtotal = useWatch({ control: form.control, name: "subtotal" }) ?? 0;
  const tax = useWatch({ control: form.control, name: "tax" }) ?? 0;
  const total = useWatch({ control: form.control, name: "total" }) ?? 0;
  const watchedItems = form.watch("items");

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="font-medium">Lignes</div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            append({
              invoice_id: invoiceId,
              description: "",
              qty: 1,
              unit_price: 0,
            } satisfies InvoiceFormValues["items"][number])
          }
        >
          <Plus className="h-4 w-4 mr-1" /> Ajouter une ligne
        </Button>
      </div>

      <Card className="mt-3 overflow-hidden">
        <CardContent className="p-0">
          {/* Scrollable on small screens */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[720px]">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">Qté</div>
                <div className="col-span-2 text-right">PU</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1" />
              </div>

              {/* Rows */}
              <div className="divide-y">
                {fields.length === 0 && (
                  <div className="px-4 py-6 text-sm text-muted-foreground">
                    Aucune ligne. Ajoutez un article pour commencer.
                  </div>
                )}

                {fields.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-muted/20">
                    <div className="col-span-6">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description` as Path<InvoiceFormValues>}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input placeholder="Description" {...field} value={String(field.value ?? "")} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.qty` as Path<InvoiceFormValues>}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input
                                type="number"
                                step="1"
                                min={1}
                                max={1000000000}
                                className="text-right tabular-nums"
                                value={String(field.value ?? "")}
                                onChange={(e) => field.onChange(e.currentTarget.value === "" ? "" : e.currentTarget.valueAsNumber)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unit_price` as Path<InvoiceFormValues>}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min={0}
                                className="text-right tabular-nums"
                                value={String(field.value ?? "")}
                                onChange={(e) => field.onChange(e.currentTarget.value === "" ? "" : e.currentTarget.valueAsNumber)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1 text-right font-medium tabular-nums">
                      {formatMoney(
                        (Number(watchedItems?.[index]?.qty) || 0) * (Number(watchedItems?.[index]?.unit_price) || 0),
                        currency
                      )}
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Supprimer</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-end">
        <TotalsCard
          subtotal={subtotal}
          tax={tax}
          total={total}
          className="w-full max-w-sm"
          currency={currency}
          taxRate={taxRate}
        />
      </div>
    </div>
  );
}
