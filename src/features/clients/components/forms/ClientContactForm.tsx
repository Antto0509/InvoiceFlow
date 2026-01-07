"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ClientContactFormValues,
  clientContactFormSchema,
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

export function ClientContactForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<ClientContactFormValues>;
  onSubmit: (values: ClientContactFormValues) => Promise<void> | void;
  loading?: boolean;
}) {
  const form = useForm<ClientContactFormValues>({
    resolver: zodResolver(clientContactFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      role: "",
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
        {/* Client lié */}
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

          {/* Nom complet */}
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Sophie Durand"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="sophie@exemple.com"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Téléphone + rôle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rôle / fonction</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Ex: "DAF", "Responsable achats"'
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
