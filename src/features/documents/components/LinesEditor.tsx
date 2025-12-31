"use client";

import * as React from "react";
import { useWatch, useFieldArray, useFormContext, type Path } from "react-hook-form";
import { Plus, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormMessage, FormControl } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TotalsCard } from "./TotalsCard";
import { formatMoney } from "@/lib/utils";
import { DEFAULT_TAX_RATE } from "@/lib/constants";

type LinesFormShape = {
  lines: Array<{
    id?: string;
    description: string;
    qty: number;
    unit_price: number;
    unit?: string | null;
    discount_rate?: number | null;
    discount_amount?: number | null;
    tax_rate?: number | null;
  }>;
  subtotal?: number;
  tax?: number;
  total?: number;
};

export function LinesEditor({
  currency_code,
  taxRate = DEFAULT_TAX_RATE,
  className,
  disabled = false,
}: {
  currency_code: string;
  taxRate?: number;
  className?: string;
  disabled?: boolean;
}) {
  const form = useFormContext<LinesFormShape>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" });

  const subtotal = useWatch({ control: form.control, name: "subtotal" }) ?? 0;
  const tax = useWatch({ control: form.control, name: "tax" }) ?? 0;
  const total = useWatch({ control: form.control, name: "total" }) ?? 0;
  const watchedLines = form.watch("lines");

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="font-medium">Lignes</div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={() =>
            append({
              description: "",
              qty: 1,
              unit_price: 0,
            } satisfies LinesFormShape["lines"][number])
          }
        >
          <Plus className="h-4 w-4 mr-1" /> Ajouter une ligne
        </Button>
      </div>

      <Card className="mt-3 overflow-hidden">
        <CardContent className="p-0">
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
                    Aucune ligne. Ajoute un article pour commencer.
                  </div>
                )}

                {fields.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-muted/20">
                    <div className="col-span-6">
                      <FormField
                        control={form.control}
                        name={`lines.${index}.description` as Path<LinesFormShape>}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input
                                disabled={disabled}
                                placeholder="Description"
                                {...field}
                                value={String(field.value ?? "")}
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
                        name={`lines.${index}.qty` as Path<LinesFormShape>}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input
                                disabled={disabled}
                                type="number"
                                step="1"
                                min={1}
                                max={1000000000}
                                className="text-right tabular-nums"
                                value={String(field.value ?? "")}
                                onChange={(e) =>
                                  field.onChange(
                                    e.currentTarget.value === "" ? "" : e.currentTarget.valueAsNumber
                                  )
                                }
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
                        name={`lines.${index}.unit_price` as Path<LinesFormShape>}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input
                                disabled={disabled}
                                type="number"
                                step="0.01"
                                min={0}
                                className="text-right tabular-nums"
                                value={String(field.value ?? "")}
                                onChange={(e) =>
                                  field.onChange(
                                    e.currentTarget.value === "" ? "" : e.currentTarget.valueAsNumber
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1 text-right font-medium tabular-nums">
                      {formatMoney(
                        (Number(watchedLines?.[index]?.qty) || 0) *
                          (Number(watchedLines?.[index]?.unit_price) || 0),
                        currency_code
                      )}
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={disabled}
                              onClick={() => remove(index)}
                            >
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
          currency_code={currency_code}
          taxRate={taxRate}
        />
      </div>
    </div>
  );
}
