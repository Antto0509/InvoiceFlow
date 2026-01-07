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

export function CompanyIdentityFields({
  form,
}: {
  form: UseFormReturn<CompanyFormValues>;
}) {
  return (
    <>
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
                <Input
                  placeholder="Ex: SAS, EI, EURL…"
                  {...field}
                  value={field.value ?? ""}
                />
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
                <Input
                  placeholder="Ex: 123 456 789"
                  {...field}
                  value={field.value ?? ""}
                />
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
                <Input
                  placeholder="Ex: 123 456 789 00012"
                  {...field}
                  value={field.value ?? ""}
                />
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
                <Input
                  placeholder="Ex: FRXX999999999"
                  {...field}
                  value={field.value ?? ""}
                />
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
                <Input
                  placeholder="Ex: Amiens"
                  {...field}
                  value={field.value ?? ""}
                />
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
                <Input
                  placeholder="Ex: 6201Z"
                  {...field}
                  value={field.value ?? ""}
                />
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
                <Input
                  placeholder="Ex: 1 000 €"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Texte libre (affiché sur facture si besoin)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
