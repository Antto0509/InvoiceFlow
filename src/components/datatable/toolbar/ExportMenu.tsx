"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download } from "lucide-react";

export function ExportMenu({
  onExportPage,
  onExportAll,
  labelAll = "Tout (CSV)",
  labelPage = "Page courante",
  disabled = false,
}: {
  onExportPage: () => void;
  onExportAll: () => void;
  labelAll?: string;
  labelPage?: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Button size="sm" variant="outline" disabled>
                <Download className="h-4 w-4 mr-1" />
                Exporter
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Bientôt disponible</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4}>
        <DropdownMenuItem onClick={onExportPage}>{labelPage}</DropdownMenuItem>
        <DropdownMenuItem onClick={onExportAll}>{labelAll}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
