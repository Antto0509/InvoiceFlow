"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  companyBankAccountSchema,
  type CompanyBankAccountFormValues,
} from "@/schemas/companies.schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FormShell } from "@/components/forms/FormShell";
import { Plus, X } from "lucide-react";

const companyBankAccountsFormSchema = z.object({
  bank_accounts: z.array(companyBankAccountSchema),
});

type CompanyBankAccountsFormValues = z.infer<typeof companyBankAccountsFormSchema>;

export function CompanyBankAccountsForm({
  companyId,
  defaultAccounts,
  onSubmit,
  loading,
}: {
  companyId: string;
  defaultAccounts?: CompanyBankAccountFormValues[];
  onSubmit: (values: CompanyBankAccountsFormValues) => Promise<void> | void;
  loading?: boolean;
}) {
  const form = useForm<CompanyBankAccountsFormValues>({
    resolver: zodResolver(companyBankAccountsFormSchema) as Resolver<CompanyBankAccountsFormValues>,
    defaultValues: {
      bank_accounts:
        defaultAccounts && defaultAccounts.length > 0
          ? defaultAccounts
          : [
              {
                company_id: companyId,
                label: "Compte principal",
                iban: "",
                bic: "",
                display: true,
              },
            ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bank_accounts",
  });

  // si on reçoit des comptes depuis le parent (édition)
  useEffect(() => {
    if (defaultAccounts) {
      form.reset({
        bank_accounts:
          defaultAccounts.length > 0
            ? defaultAccounts
            : [
                {
                  company_id: companyId,
                  label: "Compte principal",
                  iban: "",
                  bic: "",
                  display: true,
                },
              ],
      });
    }
  }, [defaultAccounts, companyId, form]);

  return (
    <Form {...form}>
      <FormShell
        onSubmit={form.handleSubmit(async (values) => {
          // petit nettoyage : on force le company_id + on upper l’IBAN/BIC
          const cleaned: CompanyBankAccountsFormValues = {
            bank_accounts: values.bank_accounts.map((acc) => ({
              ...acc,
              company_id: companyId,
              iban: acc.iban ? acc.iban.replace(/\s+/g, "").toUpperCase() : "",
              bic: acc.bic ? acc.bic.replace(/\s+/g, "").toUpperCase() : "",
            })),
          };
          await onSubmit(cleaned);
        })}
        loading={loading}
      >
        {/* company_id caché */}
        <input type="hidden" {...form.register("bank_accounts.0.company_id")} value={companyId} />

        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-4 relative space-y-4 bg-muted/20">
              {/* bouton supprimer */}
              {fields.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => remove(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              ) : null}

              {/* Libellé */}
              <FormField
                control={form.control}
                name={`bank_accounts.${index}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Libellé du compte</FormLabel>
                    <FormControl>
                      <Input placeholder="Compte pro Crédit Agricole" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                {/* IBAN */}
                <FormField
                  control={form.control}
                  name={`bank_accounts.${index}.iban`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="FR76 3000 6000 0112 3456 7890 189"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* BIC */}
                <FormField
                  control={form.control}
                  name={`bank_accounts.${index}.bic`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BIC / SWIFT</FormLabel>
                      <FormControl>
                        <Input placeholder="AGRIFRPPXXX" {...field} onChange={(e) => field.onChange(e.target.value)} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Afficher sur factures / documents */}
              <FormField
                control={form.control}
                name={`bank_accounts.${index}.display`}
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border px-3 py-2">
                    <FormLabel>Afficher ce compte sur les documents ?</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          ))}

          {/* bouton ajouter un compte */}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                company_id: companyId,
                label: "Autre compte",
                iban: "",
                bic: "",
                display: true,
              })
            }
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Ajouter un compte bancaire
          </Button>
        </div>
      </FormShell>
    </Form>
  );
}
