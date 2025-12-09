"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ClientAddressFormValues,
  clientAddressFormSchema,
  clientAddressKindEnum,
} from "@/schemas/clients.schema";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormShell } from "@/components/forms/FormShell";
import { SelectClient } from "@/components/datatable/select/SelectClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { labelAddressKind } from "@/lib/index";

export function ClientAddressForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<ClientAddressFormValues>;
  onSubmit: (values: ClientAddressFormValues) => Promise<void> | void;
  loading?: boolean;
}) {
  const form = useForm<ClientAddressFormValues>({
    resolver: zodResolver(clientAddressFormSchema),
    defaultValues: {
        client_id: defaultValues?.client_id ?? "",
        kind: defaultValues?.kind ?? "headquarters",
        line1: defaultValues?.line1 ?? "",
        line2: defaultValues?.line2 ?? "",
        city: defaultValues?.city ?? "",
        region: defaultValues?.region ?? "",
        postal_code: defaultValues?.postal_code ?? "",
        country: defaultValues?.country ?? "FR",
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
          await onSubmit(v);
        })}
        loading={loading}
      >
        {/* Ligne 1 : client + type d’adresse */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <FormControl>
                  <SelectClient
                    value={field.value ?? ""}
                    onChange={(v) => field.onChange(v)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kind"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d’adresse</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionne un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientAddressKindEnum.options.map((kind) => (
                        <SelectItem key={kind} value={kind}>
                          {labelAddressKind(kind)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Adresse ligne 1 */}
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="line1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse (ligne 1)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: 12 rue des Fleurs"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Adresse ligne 2 */}
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="line2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse (ligne 2)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Bâtiment A, Appartement 3"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Ville + CP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Paris"
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
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code postal</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: 75001"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Région + pays */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Région / État / Province</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Île-de-France"
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
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pays</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: FR"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormShell>
    </Form>
  );
}
