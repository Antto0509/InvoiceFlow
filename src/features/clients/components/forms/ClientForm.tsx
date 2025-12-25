"use client";

import { z } from "zod";
import { useEffect } from "react";
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
      address: "",
      notes: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  // 🔎 Log init + schema keys (hyper utile quand un champ n’existe pas dans Zod)
  useEffect(() => {
    console.group("🧩 ClientForm / init");
    console.info("⏳ loading:", loading);
    console.info("🧾 defaultValues (props):", defaultValues);

    const schemaKeys =
      clientFormSchema instanceof z.ZodObject
        ? Object.keys((clientFormSchema as z.ZodObject).shape)
        : [];
    
    console.info("🧷 clientFormSchema keys:", schemaKeys);

    console.info("📦 RHF defaultValues (computed):", form.getValues());
    console.groupEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔥 Attention : reset peut écraser des saisies si defaultValues change souvent
  useEffect(() => {
    if (!defaultValues) return;

    console.group("♻️ ClientForm / reset");
    console.info("📩 defaultValues changed:", defaultValues);
    console.info("📦 before reset:", form.getValues());

    form.reset({ ...form.getValues(), ...defaultValues });

    console.info("📦 after reset:", form.getValues());
    console.groupEnd();
  }, [defaultValues, form]);

  // 👀 Watch global (si ça spam trop, limite à quelques champs)
  useEffect(() => {
    const sub = form.watch((values, info) => {
      console.groupCollapsed("👁️ ClientForm / watch");
      console.info("🔁 field changed:", info?.name);
      console.info("🧭 event:", info?.type);
      console.debug("📦 values:", values);
      console.groupEnd();
    });
    return () => sub.unsubscribe();
  }, [form]);

  const handleValid = async (values: ClientFormValues) => {
    console.group("✅ ClientForm / submit(valid)");
    console.info("⏳ loading:", loading);
    console.info("📦 values (from RHF):", values);
    console.info("🧾 formState:", {
      isValid: form.formState.isValid,
      isDirty: form.formState.isDirty,
      isSubmitting: form.formState.isSubmitting,
      submitCount: form.formState.submitCount,
    });
    console.info("🧨 errors (should be empty):", form.formState.errors);

    try {
      await onSubmit(values);
      console.info("🚀 onSubmit(values) terminé sans throw");
    } catch (err) {
      console.error("❌ onSubmit(values) a throw:", err);
      throw err;
    } finally {
      console.groupEnd();
    }
  };

  const handleInvalid = (errors: typeof form.formState.errors) => {
    console.group("⛔ ClientForm / submit(invalid)");
    console.warn("Le submit est bloqué par la validation.");
    console.info("🧨 errors:", errors);
    console.info("📦 current values (RHF):", form.getValues());
    console.info("🧾 formState:", {
      isValid: form.formState.isValid,
      isDirty: form.formState.isDirty,
      submitCount: form.formState.submitCount,
    });
    console.groupEnd();
  };

  return (
    <Form {...form}>
      <FormShell
        onSubmit={form.handleSubmit(handleValid, handleInvalid)}
        loading={loading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raison/Dénomination sociale</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Acme Corp" {...field} />
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input
                  placeholder="Rue, CP, Ville"
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
          name="company_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entreprise responsable</FormLabel>
              <FormControl>
                <SelectCompany
                  value={field.value}
                  onChange={(next) => {
                    console.group("🏢 ClientForm / SelectCompany");
                    console.info("➡️ company_id change:", {
                      prev: field.value,
                      next,
                    });

                    field.onChange(next);

                    // microtask: laisse RHF mettre à jour avant de relire
                    queueMicrotask(() => {
                      console.info("📦 RHF company_id now:", form.getValues("company_id"));
                      console.info("🧨 errors.company_id:", form.formState.errors.company_id);
                      console.groupEnd();
                    });
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
