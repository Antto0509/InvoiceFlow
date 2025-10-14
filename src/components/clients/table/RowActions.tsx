"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Client } from "@/schemas/clients";

export function RowActions({
  client,
  onEdit,
  onDelete,
  alwaysVisible = false,
}: {
  client: Client;
  onEdit: (c: Client) => void;
  onDelete: (c: Client) => void;
  /** for debugging: if true, shows actions even on mobile */
  alwaysVisible?: boolean;
}) {
  return (
    <div className="relative flex justify-end">
      {/* 💻 Grand écran: boutons directs */}
      <div
        className={`
          ${alwaysVisible ? "flex" : "hidden 2xl:flex"}
          gap-2
        `}
      >
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(client)}
          className="flex items-center"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Éditer
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(client)}
          className="flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Supprimer
        </Button>
      </div>

      {/* 📱 Mobile / tablette: menu kebab */}
      {!alwaysVisible && (
        <div className="2xl:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="hover:bg-muted/80"
                aria-label="Actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className="w-40 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={() => onEdit(client)}>
                <Pencil className="h-4 w-4 mr-2" />
                Éditer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(client)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
