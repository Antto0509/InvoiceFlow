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
  return (
    <form onSubmit={onSubmit} className="contents">
      {children}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

