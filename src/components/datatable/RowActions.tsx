"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export type RowExtraAction<T> = {
  label: string;
  icon?: React.ReactNode;
  /** Soit href (lien), soit onClick (callback) */
  href?: string;
  onClick?: (item: T) => void | Promise<void>;
  /** style visuel */
  variant?: React.ComponentProps<typeof Button>["variant"];
  /** className (facultatif) */
  className?: string;
  /** séparateur au-dessus dans le menu mobile */
  separatorBefore?: boolean;
};

type RowActionsProps<T> = {
  item: T;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  labels?: { edit?: string; delete?: string; menu?: string };
  alwaysVisible?: boolean;

  /** Nouvelles actions (ex: Télécharger, Régénérer…) */
  actions?: RowExtraAction<T>[];
};

export function RowActions<T>({
  item,
  onEdit,
  onDelete,
  labels,
  alwaysVisible = false,
  actions = [],
}: RowActionsProps<T>) {
  const editLabel = labels?.edit ?? "Éditer";
  const deleteLabel = labels?.delete ?? "Supprimer";
  const menuLabel = labels?.menu ?? "Actions";

  const handle = (fn?: (i: T) => void | Promise<void>) => async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fn) await fn(item);
  };

  return (
    <div className="relative flex justify-end">
      {/* Desktop (2xl+): boutons visibles */}
      <div className={`${alwaysVisible ? "flex" : "hidden 2xl:flex"} gap-2`}>
        {/* Actions personnalisées en premier si tu préfères */}
        {actions.map((a, i) =>
          a.href ? (
            <Button
              key={i}
              asChild
              size="sm"
              variant={a.variant ?? "secondary"}
              className={a.className}
              onClick={(e) => e.stopPropagation()}
            >
              <a href={a.href} rel="nofollow noopener">
                {a.icon}
                {a.icon ? <span className="ml-1">{a.label}</span> : a.label}
              </a>
            </Button>
          ) : (
            <Button
              key={i}
              size="sm"
              variant={a.variant ?? "secondary"}
              className={a.className}
              onClick={handle(a.onClick)}
            >
              {a.icon}
              {a.icon ? <span className="ml-1">{a.label}</span> : a.label}
            </Button>
          )
        )}

        {/* Éditer / Supprimer */}
        <Button
          size="sm"
          variant="outline"
          onClick={handle(onEdit)}
          className="flex items-center"
        >
          <Pencil className="h-4 w-4 mr-1" />
          {editLabel}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handle(onDelete)}
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
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className="w-44 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Actions personnalisées */}
              {actions.map((a, i) => (
                <React.Fragment key={i}>
                  {a.separatorBefore && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={a.onClick ? () => a.onClick!(item) : undefined}
                    asChild={!!a.href}
                    className={a.className}
                  >
                    {a.href ? (
                      <a href={a.href} rel="nofollow noopener">
                        {a.icon}
                        <span className={a.icon ? "ml-2" : ""}>{a.label}</span>
                      </a>
                    ) : (
                      <>
                        {a.icon}
                        <span className={a.icon ? "ml-2" : ""}>{a.label}</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}

              {/* Séparateur si des actions custom existent */}
              {actions.length > 0 && <DropdownMenuSeparator />}

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
