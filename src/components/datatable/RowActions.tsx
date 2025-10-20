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

type RowActionsProps<T> = {
  /** L’élément de la ligne (client, facture, etc.) */
  item: T;

  /** Callbacks */
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;

  /** Libellés personnalisables */
  labels?: {
    edit?: string;
    delete?: string;
    menu?: string; // aria-label
  };

  /**
   * Affiche toujours les boutons (et pas le menu) — pratique pour debug
   * ou sur de grands écrans si tu veux forcer l’affichage.
   */
  alwaysVisible?: boolean;
};

export function RowActions<T>({
  item,
  onEdit,
  onDelete,
  labels,
  alwaysVisible = false,
}: RowActionsProps<T>) {
  const editLabel = labels?.edit ?? "Éditer";
  const deleteLabel = labels?.delete ?? "Supprimer";
  const menuLabel = labels?.menu ?? "Actions";

  return (
    <div className="relative flex justify-end">
      {/* Grand écran: boutons directs */}
      <div className={`${alwaysVisible ? "flex" : "hidden 2xl:flex"} gap-2`}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(item)}
          className="flex items-center"
        >
          <Pencil className="h-4 w-4 mr-1" />
          {editLabel}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(item)}
          className="flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {deleteLabel}
        </Button>
      </div>

      {/* Mobile / tablette: menu kebab */}
      {!alwaysVisible && (
        <div className="2xl:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="hover:bg-muted/80"
                aria-label={menuLabel}
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
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="h-4 w-4 mr-2" />
                {editLabel}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteLabel}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
