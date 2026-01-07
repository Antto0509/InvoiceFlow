"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyFormSchema, type CompanyFormValues } from "@/schemas/companies.schema";
import { Form } from "@/components/ui/form";
import { FormShell } from "@/components/forms/FormShell";

import { CompanyIdentityFields } from "./CompanyIdentityFields";
import { CompanyContactBrandingFields } from "./CompanyContactBrandingFields";
import { CompanyBillingFields } from "./CompanyBillingFields";

import { useRHFDebug } from "@/lib/forms/debug";
import { useRHFResetOnDefaultValues } from "@/lib/forms/reset";

export function CompanyForm({
  defaultValues,
  onSubmit,
  loading,
  show = "all",
}: {
  defaultValues?: Partial<CompanyFormValues>;
  onSubmit: (values: CompanyFormValues) => Promise<void> | void;
  loading?: boolean;
  show?: "all" | "identity" | "contact_branding" | "billing" | "addresses" | "bank_accounts";
}) {
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema) as Resolver<CompanyFormValues>,
    defaultValues: {
      name: "",
      legal_form: null,
      siren: null,
      siret: null,
      vat_number: null,
      rcs_city: null,
      ape_naf: null,
      share_capital: null,
      website: null,
      email: null,
      phone: null,
      logo_url: null,
      default_currency: "EUR",
      payment_terms: null,
      penalty_rate: null,
      recovery_fee_enabled: true,
      vat_regime: null,
      legal_notes: null,
      ...defaultValues,
    },
    mode: "onChange",
  });

  // ✅ DEBUG (init + watch + submit wrappers)
  const { handleValid, handleInvalid } = useRHFDebug<CompanyFormValues>({
    name: "CompanyForm",
    form,
    schema: companyFormSchema,
    loading,
    defaultValues,
    watch: {
      enabled: true,
      onlyNames: [
        "name",
        "legal_form",
        "siren",
        "siret",
        "vat_number",
        "rcs_city",
        "ape_naf",
        "share_capital",
        "website",
        "email",
        "phone",
        "logo_url",
        "default_currency",
        "payment_terms",
        "penalty_rate",
        "recovery_fee_enabled",
        "vat_regime",
        "legal_notes",
      ],
    },
  });

  // ♻️ reset quand defaultValues change (une seule source de vérité)
  useRHFResetOnDefaultValues<CompanyFormValues>({
    name: "CompanyForm",
    form,
    defaultValues,
  });

  const submit = handleValid(async (values) => {
    const payload: CompanyFormValues = {
      ...values,
      default_currency: (values.default_currency ?? "EUR").toUpperCase().slice(0, 3),
    };

    await onSubmit(payload);
  });

  return (
    <Form {...form}>
      <FormShell onSubmit={form.handleSubmit(submit, handleInvalid)} loading={loading}>
        {show === "all" && (
          <>
            <CompanyIdentityFields form={form} />
            <CompanyContactBrandingFields form={form} />
            <CompanyBillingFields form={form} />
          </>
        )}
        {show === "identity" && <CompanyIdentityFields form={form} />}
        {show === "contact_branding" && <CompanyContactBrandingFields form={form} />}
        {show === "billing" && <CompanyBillingFields form={form} />}
      </FormShell>
    </Form>
  );
}
