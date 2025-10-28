"use client";

import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays } from "lucide-react";
import { InvoiceFormValues, invoiceFormSchema } from "@/schemas/invoices.schema";
import { DEFAULT_CURRENCY, DEFAULT_TAX_RATE } from "@/lib/constants";
import { safeRandomUUID } from "@/lib/utils";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FormShell } from "@/components/forms/FormShell";
import { SelectClient } from "@/features/clients";
import { ItemsEditor } from "./ItemsEditor";
import { usePrevious } from "@/hooks/usePrevious";
import { toast } from "sonner";

export function InvoiceForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<InvoiceFormValues>;
  onSubmit: (values: InvoiceFormValues) => Promise<void> | void;
  loading?: boolean;
}) {
  const initialInvoiceIdRef = useRef<string>("");
  if (!initialInvoiceIdRef.current) initialInvoiceIdRef.current = safeRandomUUID();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const baseInvoiceId = defaultValues?.id ?? initialInvoiceIdRef.current;
  const defaultItems: InvoiceFormValues["items"] =
    defaultValues?.items && defaultValues.items.length > 0
      ? defaultValues.items
      : [
          {
            invoice_id: baseInvoiceId,
            description: "",
            qty: 1,
            unit_price: 0,
            total: 0,
          },
        ];

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema) as Resolver<InvoiceFormValues>,
    defaultValues: {
      id: baseInvoiceId,
      client_id: defaultValues?.client_id ?? undefined,
      number: defaultValues?.number ?? null,
      issue_date: defaultValues?.issue_date ?? today,
      due_date: defaultValues?.due_date ?? null,
      currency_code: defaultValues?.currency_code ?? DEFAULT_CURRENCY,
      status: defaultValues?.status ?? "draft",
      items: defaultItems, // déjà calculé plus haut
      subtotal: defaultValues?.subtotal ?? 0,
      tax: defaultValues?.tax ?? 0,
      total: defaultValues?.total ?? 0,
      tax_rate: defaultValues?.tax_rate ?? DEFAULT_TAX_RATE,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...form.getValues(),
        ...defaultValues,
        id: defaultValues.id ?? form.getValues("id") ?? initialInvoiceIdRef.current,
        tax_rate: defaultValues.tax_rate ?? form.getValues("tax_rate") ?? DEFAULT_TAX_RATE,
        items:
          defaultValues.items && defaultValues.items.length > 0
            ? defaultValues.items
            : form.getValues("items")?.length
            ? form.getValues("items")
            : [{
                invoice_id: (defaultValues.id ?? form.getValues("id") ?? initialInvoiceIdRef.current) as string,
                description: "",
                qty: 1,
                unit_price: 0,
                total: 0,
              }],
      });
    }
  }, [defaultValues, form]);

  // live totals
  const watchedItems = useWatch({ control: form.control, name: "items" });
  const items = useMemo(() => watchedItems ?? [], [watchedItems]);
  const taxRate = useWatch({ control: form.control, name: "tax_rate" }) ?? DEFAULT_TAX_RATE;
  const currency_code = useWatch({ control: form.control, name: "currency_code" }) ?? DEFAULT_CURRENCY;

  const prevCurrency = usePrevious(currency_code);

  useEffect(() => {
    if (prevCurrency && prevCurrency !== currency_code) {
      toast.warning(
        `Devise changée de ${prevCurrency} → ${currency_code}`,
        {
          description:
            "Les montants des lignes ne sont pas convertis automatiquement. Vérifie tes prix avant d’enregistrer.",
          duration: 6000,
        }
      );
    }
  }, [currency_code, prevCurrency]);

  useEffect(() => {
    const subtotal = items.reduce(
      (acc: number, it: InvoiceFormValues["items"][number]) => acc + (Number(it?.qty) || 0) * (Number(it?.unit_price) || 0),
      0
    );
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    form.setValue("subtotal", subtotal, { shouldValidate: true });
    form.setValue("tax", tax, { shouldValidate: true });
    form.setValue("total", total, { shouldValidate: true });
    form.setValue("tax_rate", taxRate, { shouldValidate: false });
  }, [items, taxRate, form]);

  const status = useWatch({ control: form.control, name: "status" }) ?? "draft";
  const statusUI: Record<string, { label: string; variant: "secondary" | "default" | "destructive" | "outline" }> = {
    draft: { label: "Brouillon", variant: "secondary" },
    sent: { label: "Envoyée", variant: "outline" },
    paid: { label: "Payée", variant: "default" },
    overdue: { label: "En retard", variant: "destructive" },
  };

  return (
    <Form {...form}>
      <FormShell
        loading={loading}
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        {/* Header card */}
        <Card className="border-muted/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardDescription>Renseignez le client, les dates et la devise, puis ajoutez vos lignes.</CardDescription>
              </div>
              <Badge variant={statusUI[status]?.variant ?? "secondary"}>{statusUI[status]?.label ?? status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <SelectClient value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                  control={form.control}
                  name="issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d&apos;émission</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="date" className="pl-8" {...field} value={field.value ?? ""} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Échéance</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="date" className="pl-8" {...field} value={field.value ?? ""} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="currency_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Devise</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={DEFAULT_CURRENCY} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR – Euro (€)</SelectItem>
                        <SelectItem value="USD">USD – US Dollar ($)</SelectItem>
                        <SelectItem value="GBP">GBP – Pound (£)</SelectItem>
                        <SelectItem value="CHF">CHF – Swiss Franc</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° de facture</FormLabel>
                    <FormControl>
                      <Input placeholder="Fac-2025-001" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TVA (%)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          max={1}
                          value={field.value?.toString() ?? ""}
                          onChange={(e) => field.onChange(e.currentTarget.value === "" ? "" : e.currentTarget.valueAsNumber)}
                        />
                        <span className="text-sm text-muted-foreground tabular-nums">{Math.round((Number(field.value) || 0) * 100)}%</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items editor */}
        <ItemsEditor
          currency_code={currency_code}
          taxRate={taxRate}
          invoiceId={(form.getValues("id") ?? initialInvoiceIdRef.current) as string}
          className="mt-4"
        />
      </FormShell>
    </Form>
  );
}