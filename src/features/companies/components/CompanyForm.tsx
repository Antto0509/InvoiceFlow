"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { companySchema } from "@/schemas/companies.schema";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { FormShell } from "@/components/forms/FormShell";
import { SelectCurrency } from "@/components/datatable/SelectCurrency";

/** On réutilise le schema complet côté form */
export type CompanyFormValues = z.infer<typeof companySchema>;

export function CompanyForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<CompanyFormValues>;
  onSubmit: (values: CompanyFormValues) => Promise<void> | void;
  loading?: boolean;
}) {
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema) as Resolver<CompanyFormValues>,
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

  useEffect(() => {
    if (defaultValues) {
      form.reset({ ...form.getValues(), ...defaultValues });
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <FormShell
        onSubmit={form.handleSubmit(async (v) => {
          // harmonisation: uppercase 3 lettres pour la devise
          const payload: CompanyFormValues = {
            ...v,
            default_currency: (v.default_currency ?? "EUR").toUpperCase().slice(0, 3),
          };
          await onSubmit(payload);
        })}
        loading={loading}
      >
        {/* Identité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l’entreprise *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Reelium" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="legal_form"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forme juridique</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: SAS, EI, EURL…" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Légal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="siren"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SIREN</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 123 456 789" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="siret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SIRET</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 123 456 789 00012" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vat_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N° TVA intracom.</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: FRXX999999999" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="rcs_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville RCS</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Amiens" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ape_naf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code APE/NAF</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 6201Z" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="share_capital"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capital social</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 1 000 €" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>Texte libre (affiché sur facture si besoin)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact & branding */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site web</FormLabel>
                <FormControl>
                  <Input placeholder="https://exemple.com" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contact@exemple.com" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+33 6 12 34 56 78" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo (URL)</FormLabel>
                <FormControl>
                  <Input placeholder="https://cdn.exemple.com/logo.png" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>On pourra switcher vers Supabase Storage plus tard.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Paramètres de facturation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="default_currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Devise par défaut</FormLabel>
                <FormControl>
                  <SelectCurrency
                    value={field.value ?? ""}
                    onChange={(v) => field.onChange(v)}
                  />
                </FormControl>
                <FormDescription>Code ISO (3 lettres), ex: EUR, USD, CHF…</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vat_regime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Régime TVA</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v)}
                  defaultValue={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="normal">Régime normal</SelectItem>
                    <SelectItem value="franchise_293B">Franchise en base (art. 293 B)</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="penalty_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taux pénalités retard</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 10 (en %)"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === "" ? null : Number(v));
                    }}
                  />
                </FormControl>
                <FormDescription>Pour info sur facture (ex: 10%/an ou /mois selon ton choix).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="payment_terms"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Conditions de paiement</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Paiement à 30 jours fin de mois" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recovery_fee_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Indemnité forfaitaire de recouvrement</FormLabel>
                  <FormDescription>Affiche 40 € de frais sur facture (B2B).</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="legal_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mentions légales (pied de facture)</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Capital, RCS, siège, TVA, mentions 293B, etc."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormShell>
    </Form>
  );
}
