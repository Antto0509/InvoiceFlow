// "@/lib/forms/debug.ts"
/* eslint-disable no-console */
"use client";

import { useEffect } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { isDev } from "@/lib/env";

/**
 * Récupère les clés d'un schéma Zod de type objet
 * @param schema Schéma Zod
 * @returns Clés du schéma si c'est un objet, sinon tableau vide
 */
export function getZodKeys(schema: unknown): string[] {
  // On évite d'importer z côté runtime si t'as pas envie :
  // on détecte "shape" de manière safe.
  const maybeObj = schema as { shape?: Record<string, unknown> } | undefined;
  if (maybeObj?.shape && typeof maybeObj.shape === "object") {
    return Object.keys(maybeObj.shape);
  }
  return [];
}

/**
 * Options pour le hook de debug RHF + Zod
 */
type RHFDebugOptions<T extends FieldValues> = {
  name: string; // ex: "DocumentForm"
  form: UseFormReturn<T>;
  schema?: unknown; // zod schema (optionnel)
  loading?: boolean;
  defaultValues?: unknown;

  // si tu veux éviter le spam, tu peux filtrer
  watch?: {
    enabled?: boolean;
    // ex: ["client_id","company_id","currency_code"]
    onlyNames?: string[];
  };
};

/**
 * Hook de debug pour les forms RHF + Zod
 * @param param0 Options de debug
 * @returns Handlers pour onSubmit
 */
export function useRHFDebug<T extends FieldValues>({
  name,
  form,
  schema,
  loading,
  defaultValues,
  watch,
}: RHFDebugOptions<T>) {
  // init
  useEffect(() => {
    if (!isDev) return;

    console.group(`🧩 ${name} / init`);
    console.info("⏳ loading:", loading);
    console.info("🧾 defaultValues (props):", defaultValues);

    if (schema) {
      console.info("🧷 schema keys:", getZodKeys(schema));
    }

    console.info("📦 RHF defaultValues (computed):", form.getValues());
    console.groupEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // watch
  useEffect(() => {
    if (!isDev) return;
    if (watch?.enabled === false) return;

    const sub = form.watch((values, info) => {
      const field = info?.name;

      if (watch?.onlyNames?.length && field && !watch.onlyNames.includes(field)) return;

      console.groupCollapsed(`👁️ ${name} / watch`);
      console.info("🔁 field changed:", field);
      console.info("🧭 event:", info?.type);
      console.debug("📦 values:", values);
      console.groupEnd();
    });

    return () => sub.unsubscribe();
  }, [form, name, watch?.enabled, watch?.onlyNames]);

  // wrappers submit
  const handleValid = (fn: (values: T) => Promise<void> | void) => async (values: T) => {
    if (isDev) {
      console.group(`✅ ${name} / submit(valid)`);
      console.info("⏳ loading:", loading);
      console.info("📦 values (from RHF):", values);
      console.info("🧾 formState:", {
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        isSubmitting: form.formState.isSubmitting,
        submitCount: form.formState.submitCount,
      });
      console.info("🧨 errors (should be empty):", form.formState.errors);
    }

    try {
      await fn(values);
      if (isDev) {
        console.info("🚀 onSubmit(values) terminé sans throw");
      }
    } catch (err) {
      if (isDev) {
        console.error("❌ onSubmit(values) a throw:", err);
      }
      throw err;
    } finally {
      if (isDev) {
        console.groupEnd();
      }
    }
  };

  const handleInvalid = (errors: typeof form.formState.errors) => {
    if (!isDev) return;
    
    console.group(`⛔ ${name} / submit(invalid)`);
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

  return { handleValid, handleInvalid };
}
