"use client";

import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import { useForm, type Path, type Resolver } from "react-hook-form";
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
    } as unknown as InvoiceFormValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...form.getValues(),
        ...defaultValues,
        id: defaultValues.id ?? form.getValues("id") ?? initialInvoiceIdRef.current,
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
  const items = form.watch("items");
  const currency = form.watch("currency") || DEFAULT_CURRENCY;
  useEffect(() => {
    const subtotal = (items || []).reduce(
      (acc, it) => acc + (Number(it?.qty) || 0) * (Number(it?.unit_price) || 0),
      0
    );
    const tax = subtotal * DEFAULT_TAX_RATE;
    const total = subtotal + tax;
    if (form.getValues("subtotal") !== subtotal) form.setValue("subtotal", subtotal, { shouldValidate: true });
    if (form.getValues("tax") !== tax) form.setValue("tax", tax, { shouldValidate: true });
    if (form.getValues("total") !== total) form.setValue("total", total, { shouldValidate: true });
    // also reflect per-line totals for UI convenience
    (items || []).forEach((it, idx: number) => {
      const lineTotal = (Number(it.qty) || 0) * (Number(it.unit_price) || 0);
      const pathTotal = `items.${idx}.total` as unknown as Path<InvoiceFormValues>;
      form.setValue(pathTotal, lineTotal as unknown as number, { shouldValidate: false });
      // ensure invoice_id present to satisfy schema
      const invId = form.getValues("id") ?? initialInvoiceIdRef.current;
      if (!it.invoice_id && invId) {
        const pathInv = `items.${idx}.invoice_id` as unknown as Path<InvoiceFormValues>;
        form.setValue(pathInv, invId as unknown as string, { shouldValidate: false });
      }
    });
  }, [items, form]);

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

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <FormControl>
                  <Input placeholder="Statut" {...field} />
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
