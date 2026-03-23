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
    e.preventDefault();
    try {
      onSubmit(e);
    } catch {
      // onSubmit errors are handled by the caller (react-hook-form)
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
