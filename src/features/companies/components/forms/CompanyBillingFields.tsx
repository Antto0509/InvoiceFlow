"use client";

import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";
import type { CompanyFormValues } from "@/schemas/companies.schema";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectCurrency } from "@/components/datatable/select/SelectCurrency";

export function CompanyBillingFields({
  form,
}: {
  form: UseFormReturn<CompanyFormValues>;
}) {
  return (
    <>
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
    </>
  );
}