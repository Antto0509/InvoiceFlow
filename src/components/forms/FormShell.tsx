"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function FormShell({
  onSubmit,
  loading,
  children,
}: {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  loading?: boolean;
  children: React.ReactNode;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.group("📝 FormShell / submit");

    try {
      e.preventDefault();

      console.info("➡️ Submit déclenché");
      console.info("⏳ Loading :", loading);

      const form = e.currentTarget;
      const formData = new FormData(form);

      const values = Object.fromEntries(formData.entries());

      console.debug("📦 Données envoyées :", values);

      onSubmit(e);

      console.info("✅ onSubmit exécuté sans erreur synchrone");
    } catch (error) {
      console.error("❌ Erreur pendant le submit :", error);
    } finally {
      console.groupEnd();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid max-h-[80vh] grid-cols-1"
    >
      <div className="overflow-y-auto space-y-6 pr-1">
        {children}
      </div>

      <div className="mt-4 border-t pt-4 flex justify-end bg-background">
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
