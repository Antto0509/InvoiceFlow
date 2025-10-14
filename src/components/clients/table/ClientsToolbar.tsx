"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Upload,
  Plus,
  ChevronDown,
  Download,
  SlidersHorizontal,   // Filtrer
  ArrowUpDown,         // Trier
  LayoutList,
  LayoutGrid,
  AlignJustify,        // Dense
  StretchVertical,     // Normal
} from "lucide-react";

export function ClientsToolbar({
  // data & actions
  query, onQuery,
  onOpenCreate, onOpenBulkAdd,
  sortKey, sortDir, onSortKeyChange, onSortDirChange,
  pageSize, onPageSizeChange,
  onExportPage, onExportAll,
  viewMode, onViewModeChange,
  density, onDensityChange,
}: {
  query: string;
  onQuery: (v: string) => void;
  onOpenCreate: () => void;
  onOpenBulkAdd: () => void;
  sortKey: "name" | "email" | "company" | "created_at";
  sortDir: "asc" | "desc";
  onSortKeyChange: (k: "name" | "email" | "company" | "created_at") => void;
  onSortDirChange: (d: "asc" | "desc") => void;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
  onExportPage: () => void;
  onExportAll: () => void;
  viewMode: "list" | "card";
  onViewModeChange: (m: "list" | "card") => void;
  density: "normal" | "dense";
  onDensityChange: (d: "normal" | "dense") => void;
}) {
  const [openFilter, setOpenFilter] = React.useState(false);
  const [openSort, setOpenSort] = React.useState(false);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          {/* Zone GAUCHE : vue + densité + filtres/tri */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Vue (liste/cartes) */}
            <div
              className="inline-flex rounded-md border bg-background p-1"
              role="tablist"
              aria-label="Mode d’affichage"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "list"}
                onClick={() => onViewModeChange("list")}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-sm px-2 sm:px-3 py-1.5 text-sm",
                  viewMode === "list" ? "bg-muted" : "hover:bg-muted/60"
                )}
                title="Vue liste"
              >
                <LayoutList className="h-4 w-4" />
                <span className="hidden sm:inline">Liste</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "card"}
                onClick={() => onViewModeChange("card")}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-sm px-2 sm:px-3 py-1.5 text-sm",
                  viewMode === "card" ? "bg-muted" : "hover:bg-muted/60"
                )}
                title="Vue cartes"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cartes</span>
              </button>
            </div>

            {/* Densité (normal/dense) */}
            <div
              className="inline-flex rounded-md border bg-background p-1"
              role="tablist"
              aria-label="Densité"
            >
              <button
                type="button"
                role="tab"
                aria-selected={density === "normal"}
                onClick={() => onDensityChange("normal")}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-sm px-2 sm:px-3 py-1.5 text-sm",
                  density === "normal" ? "bg-muted" : "hover:bg-muted/60"
                )}
                title="Densité normale"
              >
                <StretchVertical className="h-4 w-4" />
                <span className="hidden sm:inline">Normal</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={density === "dense"}
                onClick={() => onDensityChange("dense")}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-sm px-2 sm:px-3 py-1.5 text-sm",
                  density === "dense" ? "bg-muted" : "hover:bg-muted/60"
                )}
                title="Densité dense"
              >
                <AlignJustify className="h-4 w-4" />
                <span className="hidden sm:inline">Dense</span>
              </button>
            </div>

            {/* Filtrer */}
            <Popover open={openFilter} onOpenChange={setOpenFilter}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 shrink-0">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Filtrer</span>
                  <ChevronDown className="h-4 w-4 ml-2 opacity-60 hidden sm:inline" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[min(92vw,420px)]">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="q">Recherche</Label>
                    <Input
                      id="q"
                      placeholder="Nom, email, société…"
                      value={query}
                      onChange={(e) => onQuery(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Taille de page</Label>
                    <RadioGroup
                      value={String(pageSize)}
                      onValueChange={(v) => {
                        onPageSizeChange(Number(v));
                        setOpenFilter(false);
                      }}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                    >
                      {[10, 20, 50, 100].map((n) => (
                        <label key={n} className="flex items-center gap-2 rounded-md border p-2 cursor-pointer">
                          <RadioGroupItem value={String(n)} id={`ps-${n}`} />
                          <span className="text-sm">{n}/page</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Trier */}
            <Popover open={openSort} onOpenChange={setOpenSort}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 shrink-0">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Trier</span>
                  <ChevronDown className="h-4 w-4 ml-2 opacity-60 hidden sm:inline" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[min(92vw,360px)]">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Colonne</Label>
                    <RadioGroup
                      value={sortKey}
                      onValueChange={(v) => onSortKeyChange(v as "name" | "email" | "company" | "created_at")}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                    >
                      {[
                        { v: "created_at", l: "Créé le" },
                        { v: "name", l: "Nom" },
                        { v: "email", l: "Email" },
                        { v: "company", l: "Société" },
                      ].map((opt) => (
                        <label key={opt.v} className="flex items-center gap-2 rounded-md border p-2 cursor-pointer">
                          <RadioGroupItem value={opt.v as "name" | "email" | "company" | "created_at"} id={`sk-${opt.v}`} />
                          <span className="text-sm">{opt.l}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="grid gap-2">
                    <Label>Ordre</Label>
                    <RadioGroup
                      value={sortDir}
                      onValueChange={(v) => {
                        onSortDirChange(v as "asc" | "desc");
                        setOpenSort(false);
                      }}
                      className="grid grid-cols-2 gap-2"
                    >
                      {[
                        { v: "asc", l: "Ascendant" },
                        { v: "desc", l: "Descendant" },
                      ].map((opt) => (
                        <label key={opt.v} className="flex items-center gap-2 rounded-md border p-2 cursor-pointer">
                          <RadioGroupItem value={opt.v as "asc" | "desc"} id={`sd-${opt.v}`} />
                          <span className="text-sm">{opt.l}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Zone DROITE : actions */}
          <div className="flex items-center gap-2 self-stretch lg:self-auto lg:justify-end flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 shrink-0">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Exporter</span>
                  <ChevronDown className="h-4 w-4 ml-1 opacity-60 hidden sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                <DropdownMenuLabel>Exporter les données</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onExportPage}>Exporter la page courante</DropdownMenuItem>
                <DropdownMenuItem onClick={onExportAll}>Exporter tout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" onClick={onOpenBulkAdd} className="h-9 shrink-0">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Importer</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="sm:hidden">Importer (ajout en lot)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onOpenCreate} className="h-9 shrink-0">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Nouveau</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="sm:hidden">Nouveau client</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
