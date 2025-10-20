"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";

export function ExportMenu({
  onExportPage,
  onExportAll,
  labelAll = "Tout (CSV)",
  labelPage = "Page courante",
}: {
  onExportPage: () => void;
  onExportAll: () => void;
  labelAll?: string;
  labelPage?: string;
}) {
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
