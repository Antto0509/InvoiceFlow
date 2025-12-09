"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type FetchArgs = { search?: string; limit?: number; signal?: AbortSignal };

export type EntitySelectProps<T> = {
  /** id sélectionné (string UUID généralement) */
  value?: string;
  /** callback quand l’id change (ou undefined pour “aucun”) */
  onChange?: (id?: string) => void;

  /** comment afficher un item (dans la liste) */
  toLabel: (item: T) => string;
  /** fetch des options (respecte { search, limit, signal }) */
  fetch: (args: FetchArgs) => Promise<T[]>;

  /** l’attribut id dans l’item (par défaut "id") */
  getId?: (item: T) => string;

  /** libellé à afficher quand une valeur est déjà connue hors liste */
  valueLabel?: string;

  /** placeholder bouton / champ de recherche */
  placeholder?: string;
  searchPlaceholder?: string;

  /** nombre max d’items à charger */
  limit?: number;

  /** désactiver le composant */
  disabled?: boolean;

  /** largeur du bouton */
  buttonClassName?: string;

  /** affichage custom d’une ligne (optionnel) */
  renderItem?: (item: T, selected: boolean) => React.ReactNode;
};

export function EntitySelect<T>({
  value,
  onChange,
  toLabel,
  fetch,
  getId = ((i: T) => (i as unknown as { id: string }).id),
  valueLabel,
  placeholder = "Sélectionner…",
  searchPlaceholder = "Rechercher…",
  limit = 20,
  disabled,
  buttonClassName,
  renderItem,
}: EntitySelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [term, setTerm] = React.useState("");
  const debounced = useDebouncedValue(term, 150);

  const [items, setItems] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const selectedItem = React.useMemo(() => items.find((i) => getId(i) === value), [items, value, getId]);
  const selectedLabel = selectedItem ? toLabel(selectedItem) : valueLabel;

  React.useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const data = await fetch({ search: debounced || undefined, limit, signal: controller.signal });
        setItems(data ?? []);
      } catch (e: unknown) {
        const name = (e as { name?: string })?.name;
        if (name === "AbortError") return;
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [debounced, limit, fetch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", buttonClassName)}
          disabled={disabled}
        >
          <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
            {selectedLabel || placeholder}
          </span>
          <div className="ml-2 flex items-center gap-1">
            {value && (
              <X
                className="h-4 w-4 opacity-60 hover:opacity-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.(undefined);
                }}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        /* largeur = largeur du trigger (Radix expose cette CSS var) */
        className="p-0 w-[--radix-popper-anchor-width] min-w-60"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={term}
            onValueChange={setTerm}
            placeholder={searchPlaceholder}
            autoFocus
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Chargement…" : "Aucun résultat"}
            </CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const id = getId(item);
                const isSelected = id === value;
                return (
                  <CommandItem
                    key={id}
                    value={id}
                    onSelect={() => {
                      onChange?.(id);
                      setOpen(false);
                      setTerm("");
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    {renderItem ? renderItem(item, isSelected) : <span className="truncate">{toLabel(item)}</span>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
