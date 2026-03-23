// "@/lib/forms/reset.ts"
/* eslint-disable no-console */
"use client";

import { useEffect } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { isDev } from "@/lib/env";

type Options<T extends FieldValues> = {
  name: string;
  form: UseFormReturn<T>;
  defaultValues?: Partial<T>;
  enabled?: boolean;
};

/**
 * Reset RHF quand defaultValues change, en mergeant avec les valeurs courantes
 */
export function useRHFResetOnDefaultValues<T extends FieldValues>({
  name,
  form,
  defaultValues,
  enabled = true,
}: Options<T>) {
  useEffect(() => {
    if (!enabled) return;
    if (!defaultValues) return;

    if (isDev) {
        console.group(`♻️ ${name} / reset`);
        console.info("📩 defaultValues changed:", defaultValues);
        console.info("📦 before reset:", form.getValues());
    }

    form.reset({ ...(form.getValues() as T), ...(defaultValues as T) });

    if (isDev) {
        console.info("📦 after reset:", form.getValues());
        console.groupEnd();
    }
  }, [defaultValues, enabled, form, name]);
}
