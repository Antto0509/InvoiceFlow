"use client";

import * as React from "react";
import { Client } from "@/schemas/clients.schema";
import { RowActions } from "@/components/datatable/RowActions";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

export function ClientCard({
  client,
  selected,
  onToggle,
  onEdit,
  onDelete,
  variant = "compact", // "default" | "compact" (compact par défaut)
}: {
  client: Client;
  selected: boolean;
  onToggle: (id: string) => void;
  onEdit: (c: Client) => void;
  onDelete: (c: Client) => void;
  variant?: "default" | "compact";
}) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card transition-all hover:shadow-md",
        isCompact ? "p-3" : "p-4",
        "flex flex-col justify-between gap-2",
        selected && "ring-2 ring-primary/50"
      )}
    >
      {/* Sélection + infos principales */}
      <div className="flex items-start gap-2">
        <div className="pt-0.5 shrink-0">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggle(client.id)}
            aria-label={`Sélectionner ${client.name}`}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className={cn("truncate font-semibold", isCompact ? "text-sm" : "text-base sm:text-sm")}>
            {client.name}
          </div>

          {client.email && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}

          {(client.company || client.phone) && (
            <div className={cn("text-xs truncate flex items-center gap-1", isCompact && "text-muted-foreground")}>
              <Building2 className="h-3 w-3 shrink-0 opacity-70" />
              <span className="truncate">
                {client.company ?? "—"}{client.phone ? " • " : ""}
              </span>
              {client.phone && (
                <span className="flex items-center gap-1 truncate">
                  <Phone className="h-3 w-3 shrink-0 opacity-70" />
                  {client.phone}
                </span>
              )}
            </div>
          )}

          {/* Adresse & date : visibles à partir de sm en compact */}
          {client.address && (
            <div className={cn("flex items-center gap-1 text-xs text-muted-foreground truncate", "hidden sm:flex")}>
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{client.address}</span>
            </div>
          )}

          {client.created_at && (
            <div className={cn("text-[11px] text-muted-foreground/70", "hidden sm:block")}>
              Créé le {new Date(client.created_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={cn("flex justify-end", isCompact ? "mt-1" : "mt-2")}>
        <RowActions item={client} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}
