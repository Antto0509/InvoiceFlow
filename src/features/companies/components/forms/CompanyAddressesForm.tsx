"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companyAddressSchema,
  type CompanyAddressFormValues,
  companyAddressKindEnum,
} from "@/schemas/companies.schema";
import { z } from "zod";

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormShell } from "@/components/forms/FormShell";
import { X, Plus } from "lucide-react";
import { labelAddressKind } from "@/lib/utils";

const companyAddressesFormSchema = z.object({
  addresses: z.array(companyAddressSchema),
});
type CompanyAddressesFormValues = z.infer<typeof companyAddressesFormSchema>;

export function CompanyAddressesForm({
  companyId,
  defaultAddresses,
  onSubmit,
  loading,
}: {
  companyId: string;
  defaultAddresses?: CompanyAddressFormValues[];
  onSubmit: (values: CompanyAddressesFormValues) => Promise<void> | void;
  loading?: boolean;
}) {
  const form = useForm<CompanyAddressesFormValues>({
    resolver: zodResolver(companyAddressesFormSchema) as Resolver<CompanyAddressesFormValues>,
    defaultValues: {
      addresses:
        defaultAddresses && defaultAddresses.length > 0
          ? defaultAddresses
          : [
              {
                company_id: companyId,
                kind: "billing",
                line1: "",
                line2: "",
                city: "",
                postal_code: "",
                region: "",
                country: "FR",
              },
            ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "addresses",
  });

  // si on reçoit du nouveau depuis le parent (édition)
  useEffect(() => {
    if (defaultAddresses) {
      form.reset({
        addresses:
          defaultAddresses.length > 0
            ? defaultAddresses
            : [
                {
                  company_id: companyId,
                  kind: "billing",
                  line1: "",
                  line2: "",
                  city: "",
                  postal_code: "",
                  region: "",
                  country: "FR",
                },
              ],
      });
    }
  }, [defaultAddresses, companyId, form]);

  return (
    <Form {...form}>
      <FormShell
        onSubmit={form.handleSubmit(async (values) => {
          // on nettoie toutes les adresses avant d’envoyer
          const cleaned: CompanyAddressesFormValues = {
            addresses: values.addresses.map((addr) => ({
              ...addr,
              line2: addr.line2 ? addr.line2 : null,
              postal_code: addr.postal_code ? addr.postal_code : null,
              city: addr.city ? addr.city : null,
              region: addr.region ? addr.region : null,
              company_id: companyId, // on force au cas où
            })),
          };
          await onSubmit(cleaned);
        })}
        loading={loading}
      >
        {/* champ caché */}
        <input type="hidden" {...form.register("addresses.0.company_id")} value={companyId} />

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

              <div className="grid gap-4 md:grid-cols-2">
                {/* Type d’adresse */}
                <FormField
                  control={form.control}
                  name={`addresses.${index}.kind`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d’adresse</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companyAddressKindEnum.options.map((k) => (
                            <SelectItem key={k} value={k}>
                              {labelAddressKind(k)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pays */}
                <FormField
                  control={form.control}
                  name={`addresses.${index}.country`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <FormControl>
                        <Input placeholder="FR" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ligne 1 */}
              <FormField
                control={form.control}
                name={`addresses.${index}.line1`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse (ligne 1)</FormLabel>
                    <FormControl>
                      <Input placeholder="12 rue de la Paix" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ligne 2 */}
              <FormField
                control={form.control}
                name={`addresses.${index}.line2`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complément (ligne 2)</FormLabel>
                    <FormControl>
                      <Input placeholder="Bâtiment B, Escalier 2…" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                {/* Code postal */}
                <FormField
                  control={form.control}
                  name={`addresses.${index}.postal_code`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal</FormLabel>
                      <FormControl>
                        <Input placeholder="75001" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ville */}
                <FormField
                  control={form.control}
                  name={`addresses.${index}.city`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input placeholder="Paris" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Région */}
                <FormField
                  control={form.control}
                  name={`addresses.${index}.region`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Région / État / Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Île-de-France" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          {/* bouton ajouter une adresse */}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                company_id: companyId,
                kind: "billing",
                line1: "",
                line2: "",
                city: "",
                postal_code: "",
                region: "",
                country: "FR",
              })
            }
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Ajouter une adresse
          </Button>
        </div>
      </FormShell>
    </Form>
  );
}
