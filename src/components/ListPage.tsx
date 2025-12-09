"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ListPageProps {
  title: string;
  description?: string;
  className?: string;
  /** Right-aligned actions next to the title (e.g., New, Import, Export) */
  actions?: React.ReactNode;
  /** Optional toolbar row under the header (filters/sort/view/density) */
  toolbar?: React.ReactNode;
  /** Main content (usually a table) */
  children: React.ReactNode;
}

export function ListPage({ title, description, actions, toolbar, className, children }: ListPageProps) {
  return (
    <div className={cn("p-6 space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          {description ? (
            <p className="text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>

      {toolbar ? <div className="pt-2">{toolbar}</div> : null}

      <div className="pt-2">{children}</div>
    </div>
  );
}