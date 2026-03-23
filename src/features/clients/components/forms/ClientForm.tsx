"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ClientFormValues, clientFormSchema } from "@/schemas/clients.schema";
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
import { SelectCompany } from "@/components/datatable/select/SelectCompany";

import { useRHFDebug } from "@/lib/forms/debug";
import { useRHFResetOnDefaultValues } from "@/lib/forms/reset";

export function ClientForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<ClientFormValues>;
  onSubmit: (values: ClientFormValues) => Promise<void> | void;
  loading?: boolean;
}) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  // ✅ DEBUG (init + watch + submit wrappers)
  const { handleValid, handleInvalid } = useRHFDebug<ClientFormValues>({
    name: "ClientForm",
    form,
    schema: clientFormSchema,
    loading,
    defaultValues,
    watch: {
      enabled: true,
      onlyNames: ["name", "email", "phone", "company_id", "notes"],
    },
  });

  // ♻️ reset quand defaultValues change (comme avant, mais factorisé)
  useRHFResetOnDefaultValues<ClientFormValues>({
    name: "ClientForm",
    form,
    defaultValues,
  });

  return (
    <Form {...form}>
      <FormShell onSubmit={form.handleSubmit(handleValid(onSubmit), handleInvalid)} loading={loading}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raison/Dénomination sociale</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Acme Corp" {...field} value={field.value ?? ""} />
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
                  <Input
                    type="email"
                    placeholder="marie@exemple.com"
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: +33 6 12 34 56 78"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="company_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entreprise responsable</FormLabel>
              <FormControl>
                <SelectCompany
                  value={field.value}
                  onChange={(next) => {
                    field.onChange(next);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input
                  placeholder="Infos internes (optionnel)"
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
