"use client";

import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormShell } from "@/components/forms/FormShell";
import { LinesEditor } from "./LinesEditor";

import { SelectClient } from "@/components/datatable/select/SelectClient";
import { SelectCurrency } from "@/components/datatable/select/SelectCurrency";
import { SelectCompany } from "@/components/datatable/select/SelectCompany";

import { safeRandomUUID } from "@/lib/utils";
import { DEFAULT_CURRENCY, DEFAULT_TAX_RATE } from "@/lib/constants";

import {
  DocumentFormValues,
  DocumentFormSchema,
  DocumentKind,
  DocumentStatus,
} from "@/schemas/documents.schema";
import { labelDocStatus, getDocStatusVariant } from "@/lib/utils";

import { useRHFDebug } from "@/lib/forms/debug";
import { useRHFResetOnDefaultValues } from "@/lib/forms/reset";

const kindConfig: Record<
  DocumentKind,
  { title: string; showDueDate: boolean; allowedStatuses: DocumentStatus[] }
> = {
  invoice: {
    title: "Créer une facture",
    showDueDate: true,
    allowedStatuses: ["draft", "sent", "paid", "overdue", "void"],
  },
  credit_note: {
    title: "Créer un avoir",
    showDueDate: false,
    allowedStatuses: ["draft", "sent", "void"],
  },
  quote: {
    title: "Créer un devis",
    showDueDate: false,
    allowedStatuses: ["draft", "sent", "accepted", "declined", "expired", "void"],
  },
  proforma: {
    title: "Créer une proforma",
    showDueDate: false,
    allowedStatuses: ["draft", "sent", "void"],
  },
};

// Transitions métier (pour éviter draft -> paid direct)
const DOC_TRANSITIONS: Record<DocumentKind, Record<DocumentStatus, DocumentStatus[]>> = {
  invoice: {
    draft: ["sent", "void"],
    sent: ["paid", "overdue", "void"],
    overdue: ["paid", "void"],
    paid: [],
    void: [],
    accepted: [],
    declined: [],
    expired: [],
  },
  quote: {
    draft: ["sent", "void"],
    sent: ["accepted", "declined", "expired", "void"],
    accepted: [],
    declined: [],
    expired: [],
    void: [],
    paid: [],
    overdue: [],
  },
  credit_note: {
    draft: ["sent", "void"],
    sent: ["void"],
    void: [],
    paid: [],
    overdue: [],
    accepted: [],
    declined: [],
    expired: [],
  },
  proforma: {
    draft: ["sent", "void"],
    sent: ["void"],
    void: [],
    paid: [],
    overdue: [],
    accepted: [],
    declined: [],
    expired: [],
  },
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function DocumentForm({
  kind,
  defaultValues,
  onSubmit,
  loading,
}: {
  kind: DocumentKind;
  defaultValues?: Partial<DocumentFormValues>;
  onSubmit: (values: DocumentFormValues) => Promise<void> | void;
  loading?: boolean;
}) {
  const cfg = kindConfig[kind];

  const initialDocIdRef = useRef<string>("");
  if (!initialDocIdRef.current) initialDocIdRef.current = safeRandomUUID();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const baseDocId = defaultValues?.id ?? initialDocIdRef.current;

  const defaultLines: DocumentFormValues["lines"] =
    defaultValues?.lines && defaultValues.lines.length > 0
      ? defaultValues.lines
      : [
          {
            kind: "service",
            description: "",
            qty: 1,
            unit_price: 0,
            unit: null,
            discount_rate: null,
            discount_amount: null,
            tax_rate: DEFAULT_TAX_RATE,
          },
        ];

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(DocumentFormSchema) as Resolver<DocumentFormValues>,
    defaultValues: {
      id: baseDocId,
      user_id: defaultValues?.user_id ?? undefined,
      client_id: defaultValues?.client_id ?? undefined,
      company_id: defaultValues?.company_id ?? undefined,
      number: defaultValues?.number ?? null,
      number_readonly: defaultValues?.number_readonly ?? null,
      sequence_number: defaultValues?.sequence_number ?? null,
      issue_date: defaultValues?.issue_date ?? today,
      due_date: defaultValues?.due_date ?? null,
      supply_date: defaultValues?.supply_date ?? null,
      currency_code: defaultValues?.currency_code ?? DEFAULT_CURRENCY,
      status:
        defaultValues?.status && cfg.allowedStatuses.includes(defaultValues.status)
          ? defaultValues.status
          : "draft",
      kind: defaultValues?.kind ?? "invoice",
      reference_document_id: defaultValues?.reference_document_id ?? null,
      payment_terms: defaultValues?.payment_terms ?? null,
      penalty_rate: defaultValues?.penalty_rate ?? null,
      recovery_fee: defaultValues?.recovery_fee ?? null,
      purchase_order_number: defaultValues?.purchase_order_number ?? null,

      notes_public: defaultValues?.notes_public ?? null,
      notes_private: defaultValues?.notes_private ?? null,

      pdf_url: defaultValues?.pdf_url ?? null,

      subtotal: defaultValues?.subtotal ?? 0,
      tax: defaultValues?.tax ?? 0,
      total: defaultValues?.total ?? 0,
      total_eur: defaultValues?.total_eur ?? null,

      lines: defaultLines,
    },
    mode: "onChange",
  });

  // ✅ DEBUG
  const { handleValid, handleInvalid } = useRHFDebug<DocumentFormValues>({
    name: "DocumentForm",
    form,
    schema: DocumentFormSchema,
    loading,
    defaultValues,
    watch: {
      enabled: true,
      onlyNames: ["client_id", "company_id", "currency_code", "issue_date", "due_date", "status"],
    },
  });

  // ♻️ Reset quand defaultValues change (comme ClientForm)
  useRHFResetOnDefaultValues<DocumentFormValues>({
    name: "DocumentForm",
    form,
    defaultValues,
  });

  // ✅ statut enregistré (référence stable, utilisée pour transitions + locks)
  const baseStatusRef = useRef<DocumentStatus>(
    (defaultValues?.status && cfg.allowedStatuses.includes(defaultValues.status)
      ? defaultValues.status
      : "draft") as DocumentStatus
  );

  useEffect(() => {
    baseStatusRef.current =
      (defaultValues?.status && cfg.allowedStatuses.includes(defaultValues.status)
        ? defaultValues.status
        : "draft") as DocumentStatus;
  }, [defaultValues?.id, defaultValues?.status, cfg.allowedStatuses]);

  const baseStatus = baseStatusRef.current;

  // ✅ règles de verrouillage (basées sur le statut enregistré)
  const isFinal = useMemo(() => {
    // facture : paid/void final
    // devis : accepted/declined/expired/void final
    return (
      baseStatus === "paid" ||
      baseStatus === "void" ||
      baseStatus === "accepted" ||
      baseStatus === "declined" ||
      baseStatus === "expired"
    );
  }, [baseStatus]);

  const isSentLike = useMemo(() => baseStatus === "sent" || baseStatus === "overdue", [baseStatus]);

  // Dès que c’est “envoyé” ou “final”, on fige le contenu financier
  const lockFinancial = isFinal || isSentLike;

  // Notes : on peut être plus souple
  const lockNotesPublic = isFinal || isSentLike; // visible client => strict
  const lockNotesPrivate = false; // interne => reste modifiable

  // WATCH
  const emptyLines = useMemo(() => [] as DocumentFormValues["lines"], []);

  const watchedLinesRaw = useWatch({ control: form.control, name: "lines" }) as
    | DocumentFormValues["lines"]
    | undefined;

  const watchedLines = watchedLinesRaw ?? emptyLines;

  const currency_code = useWatch({ control: form.control, name: "currency_code" }) ?? DEFAULT_CURRENCY;
  const status = useWatch({ control: form.control, name: "status" }) ?? "draft";

  // TVA globale (UI only) -> pousse sur lines.tax_rate
  const [globalTaxRate, setGlobalTaxRate] = React.useState<number>(DEFAULT_TAX_RATE);

  useEffect(() => {
    const fromLines =
      (defaultValues?.lines ?? []).find((l) => l?.tax_rate != null)?.tax_rate ??
      watchedLines.find((l) => l?.tax_rate != null)?.tax_rate ??
      DEFAULT_TAX_RATE;

    setGlobalTaxRate(typeof fromLines === "number" ? fromLines : DEFAULT_TAX_RATE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.id]);

  const applyGlobalTaxRate = React.useCallback(
    (nextRate: number) => {
      const safe = Number.isFinite(nextRate) ? nextRate : 0;
      setGlobalTaxRate(safe);

      // si verrouillé => on ne touche pas
      if (lockFinancial) return;

      const current = form.getValues("lines") ?? [];
      const nextLines = current.map((ln) => ({
        ...ln,
        tax_rate: safe,
      }));

      form.setValue("lines", nextLines, { shouldDirty: true, shouldValidate: true });
    },
    [form, lockFinancial]
  );

  // Conversion devise: avertissement (on laisse le warning même si lock)
  const prevCurrency = React.useRef<string | null>(null);
  useEffect(() => {
    if (prevCurrency.current && prevCurrency.current !== currency_code) {
      toast.warning(`Devise changée de ${prevCurrency.current} → ${currency_code}`, {
        description: "Les montants de lignes ne sont pas convertis automatiquement.",
        duration: 6000,
      });
    }
    prevCurrency.current = currency_code;
  }, [currency_code]);

  // Totaux live (depuis lignes + taux par ligne)
  useEffect(() => {
    const subtotal = round2(
      watchedLines.reduce((acc, ln) => {
        const qty = Number(ln?.qty) || 0;
        const unitPrice = Number(ln?.unit_price) || 0;
        return acc + qty * unitPrice;
      }, 0)
    );

    const tax = round2(
      watchedLines.reduce((acc, ln) => {
        const qty = Number(ln?.qty) || 0;
        const unitPrice = Number(ln?.unit_price) || 0;
        const base = qty * unitPrice;

        const rate = Number(ln?.tax_rate) || 0;
        return acc + base * rate;
      }, 0)
    );

    const total = round2(subtotal + tax);

    form.setValue("subtotal", subtotal, { shouldValidate: false, shouldDirty: true });
    form.setValue("tax", tax, { shouldValidate: false, shouldDirty: true });
    form.setValue("total", total, { shouldValidate: false, shouldDirty: true });
  }, [watchedLines, form]);

  // statuses sélectionnables basés sur le statut enregistré (pas celui du form)
  const selectableStatuses = useMemo(() => {
    const base = baseStatusRef.current;

    const transitions = DOC_TRANSITIONS[kind]?.[base] ?? [];
    const allowed = new Set(cfg.allowedStatuses);

    const set = new Set<DocumentStatus>([base, ...transitions.filter((s) => allowed.has(s))]);

    // On inclut le status choisi si tu veux éviter l'effet "disparaît" (facultatif)
    set.add(status);

    return Array.from(set).filter((s) => cfg.allowedStatuses.includes(s));
  }, [kind, cfg.allowedStatuses, status]);

  return (
    <Form {...form}>
      <FormShell
        loading={loading}
        onSubmit={form.handleSubmit(
          handleValid(async (values) => {
            await onSubmit(values);
          }),
          handleInvalid
        )}
      >
        <Card className="border-muted/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardDescription>
                  {kind === "invoice"
                    ? "Renseigne le client, la date et la devise, puis ajoute tes lignes."
                    : "Renseigne le client, la date et la devise, puis compose ton devis."}
                </CardDescription>
              </div>

              <Badge variant={getDocStatusVariant(status) ?? "secondary"}>
                {labelDocStatus(kind, status)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Client */}
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <SelectClient 
                      value={field.value} 
                      onChange={(next) => {
                        console.group("👤 DocumentForm / SelectClient");
                        console.info("➡️ client_id change:", { prev: field.value, next });
                        field.onChange(next);
                        queueMicrotask(() => {
                          console.info("📦 RHF client_id now:", form.getValues("client_id"));
                          console.info("🧨 errors.client_id:", form.formState.errors.client_id);
                          console.groupEnd();
                        });
                      }}
                      disabled={lockFinancial} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Société émettrice */}
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entreprise</FormLabel>
                  <FormControl>
                    <SelectCompany 
                      value={field.value} 
                      onChange={(next) => {
                        console.group("🏢 DocumentForm / SelectCompany");
                        console.info("➡️ company_id change:", { prev: field.value, next });
                        field.onChange(next);
                        queueMicrotask(() => {
                          console.info("📦 RHF company_id now:", form.getValues("company_id"));
                          console.info("🧨 errors.company_id:", form.formState.errors.company_id);
                          console.groupEnd();
                        });
                      }} 
                      disabled={lockFinancial} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Statut */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Statut
                    <span className="ml-2 text-xs text-muted-foreground">
                      (enregistré : {labelDocStatus(kind, baseStatusRef.current)})
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isFinal}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectableStatuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {labelDocStatus(kind, s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Numéro doc */}
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N° de document</FormLabel>
                  <FormControl>
                    <Input
                      disabled={lockFinancial}
                      placeholder={kind === "invoice" ? "FAC-2025-001" : "DEV-2025-001"}
                      {...field}
                      value={field.value?.toUpperCase() ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 md:col-span-2">
              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d’émission</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          className="pl-8"
                          {...field}
                          value={field.value ?? ""}
                          disabled={lockFinancial}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {cfg.showDueDate && (
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Échéance</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            className="pl-8"
                            {...field}
                            value={field.value ?? ""}
                            disabled={lockFinancial}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Devise */}
            <FormField
              control={form.control}
              name="currency_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Devise</FormLabel>
                  <FormControl>
                    <SelectCurrency value={field.value} onChange={field.onChange} disabled={lockFinancial} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* TVA globale UI */}
            <FormItem>
              <FormLabel>TVA (globale)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    max={1}
                    disabled={lockFinancial}
                    value={Number.isFinite(globalTaxRate) ? globalTaxRate : 0}
                    onChange={(e) =>
                      applyGlobalTaxRate(
                        e.currentTarget.value === "" ? 0 : e.currentTarget.valueAsNumber
                      )
                    }
                  />
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {Math.round((Number(globalTaxRate) || 0) * 100)}%
                  </span>
                </div>
              </FormControl>
            </FormItem>

            {/* Note publique */}
            <FormField
              control={form.control}
              name="notes_public"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Note publique</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      disabled={lockNotesPublic}
                      placeholder="Visible sur le document (PDF)…"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Note privée */}
            <FormField
              control={form.control}
              name="notes_private"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Note privée</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      disabled={lockNotesPrivate}
                      placeholder="Interne, non visible par le client…"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <LinesEditor
          currency_code={currency_code}
          taxRate={globalTaxRate}
          className="mt-4"
          disabled={lockFinancial}
        />
      </FormShell>
    </Form>
  );
}
