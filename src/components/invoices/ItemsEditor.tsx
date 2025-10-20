"use client";

import * as React from "react";
import { useFieldArray, useFormContext, type Path } from "react-hook-form";
import { Plus, Trash } from "lucide-react";
import { InvoiceFormValues } from "@/schemas/invoices";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { formatMoney } from "@/lib/utils";
import { TotalsCard } from "./TotalsCard";
import { DEFAULT_TAX_RATE } from "@/lib/constants";

export function ItemsEditor({
  currency,
  invoiceId,
  className,
}: {
  currency: string;
  invoiceId: string;
  className?: string;
}) {
  const form = useFormContext<InvoiceFormValues>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
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
              total: 0,
            } satisfies InvoiceFormValues["items"][number])
          }
        >
          <Plus className="h-4 w-4 mr-1" /> Ajouter une ligne
        </Button>
      </div>

      <Card className="mt-3">
        <CardContent className="p-4">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground mb-2">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qté</div>
            <div className="col-span-2 text-right">PU</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="space-y-2">
            {fields.map((row, index) => (
              <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description` as unknown as Path<InvoiceFormValues>}
                    render={({ field }) => {
                      const { value, onChange, onBlur, name } = field;
                      return (
                        <FormItem className="mb-0">
                          <FormControl>
                            <Input
                              placeholder="Description"
                              value={String(value ?? "")}
                              onChange={onChange}
                              onBlur={onBlur}
                              name={name}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.qty` as unknown as Path<InvoiceFormValues>}
                    render={({ field }) => {
                      const { value, onChange, onBlur, name } = field;
                      return (
                        <FormItem className="mb-0">
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              min={0}
                              value={String(value ?? "")}
                              onChange={onChange}
                              onBlur={onBlur}
                              name={name}
                              className="text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.unit_price` as unknown as Path<InvoiceFormValues>}
                    render={({ field }) => {
                      const { value, onChange, onBlur, name } = field;
                      return (
                        <FormItem className="mb-0">
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              value={String(value ?? "")}
                              onChange={onChange}
                              onBlur={onBlur}
                              name={name}
                              className="text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <div className="col-span-1 text-right font-medium">
                  {formatMoney(
                    (Number(watchedItems?.[index]?.qty) || 0) * (Number(watchedItems?.[index]?.unit_price) || 0),
                    currency
                  )}
                </div>

                <div className="col-span-1 flex justify-end">
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <TotalsCard
          subtotal={form.getValues("subtotal") || 0}
          tax={form.getValues("tax") || 0}
          total={form.getValues("total") || 0}
          className="w-full max-w-sm"
          currency={currency}
          taxRate={DEFAULT_TAX_RATE}
        />
      </div>
    </div>
  );
}
