"use client";

import * as React from "react";
import { useWatch } from "react-hook-form";
import { useEffect, useMemo, useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InvoiceFormValues, invoiceFormSchema } from "@/schemas/invoices.schema";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SelectClient } from "@/features/clients";
import { FormShell } from "@/components/forms/FormShell";
import { ItemsEditor } from "./ItemsEditor";
import { DEFAULT_CURRENCY, DEFAULT_TAX_RATE } from "@/lib/constants";
import { safeRandomUUID } from "@/lib/utils";

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
    resolver: zodResolver(invoiceFormSchema) as unknown as Resolver<InvoiceFormValues>,
    defaultValues: {
      id: baseInvoiceId,
      // keep empty until user selects a client
      client_id: (defaultValues?.client_id ?? undefined) as unknown as string,
      number: defaultValues?.number ?? null,
      issue_date: defaultValues?.issue_date ?? today,
      due_date: defaultValues?.due_date ?? null,
      currency: defaultValues?.currency ?? DEFAULT_CURRENCY,
      status: defaultValues?.status ?? "draft",
      items: defaultItems,
      subtotal: defaultValues?.subtotal ?? 0,
      tax: defaultValues?.tax ?? 0,
      total: defaultValues?.total ?? 0,
      tax_rate: defaultValues?.tax_rate ?? DEFAULT_TAX_RATE,
    } as unknown as InvoiceFormValues,
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
            : form.getValues("items").length > 0
            ? (form.getValues("items") as InvoiceFormValues["items"])
            : ([
                {
                  invoice_id: (defaultValues.id ?? form.getValues("id") ?? initialInvoiceIdRef.current) as string,
                  description: "",
                  qty: 1,
                  unit_price: 0,
                  total: 0,
                },
              ] as InvoiceFormValues["items"]),
      });
    }
  }, [defaultValues, form]);

  // Recalcul des totaux lorsque items changent
  const watchedItems = useWatch({ control: form.control, name: "items" });
  const items = useMemo(() => watchedItems ?? [], [watchedItems]);
  const taxRate = useWatch({ control: form.control, name: "tax_rate" }) ?? DEFAULT_TAX_RATE;
  const currency = useWatch({ control: form.control, name: "currency" }) ?? DEFAULT_CURRENCY;

  useEffect(() => {
    const subtotal = items.reduce((acc, it) =>
      acc + (Number(it?.qty) || 0) * (Number(it?.unit_price) || 0), 0);

    const tax   = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    form.setValue("subtotal", subtotal, { shouldValidate: true });
    form.setValue("tax",      tax,      { shouldValidate: true });
    form.setValue("total",    total,    { shouldValidate: true });

    form.setValue("tax_rate", taxRate,  { shouldValidate: false });
  }, [items, taxRate, form]);

  return (
    <Form {...form}>
      <FormShell
        loading={loading}
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Devise</FormLabel>
                <FormControl>
                  <Input placeholder={DEFAULT_CURRENCY} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />
        <ItemsEditor
          currency={currency}
          invoiceId={(form.getValues("id") ?? initialInvoiceIdRef.current) as string}
          className="space-y-3"
        />
      </FormShell>
    </Form>
  );
}
