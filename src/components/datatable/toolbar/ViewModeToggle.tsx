"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { LayoutList, LayoutGrid } from "lucide-react";

export function ViewModeToggle({
  value,
  onChange,
}: {
  value: "list" | "card";
  onChange: (v: "list" | "card") => void;
}) {
  return (
    <div className="flex rounded-lg border p-1">
      <Button
        size="icon"
        variant={value === "list" ? "default" : "ghost"}
        onClick={() => onChange("list")}
        aria-label="Vue liste"
      >
        <LayoutList className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant={value === "card" ? "default" : "ghost"}
        onClick={() => onChange("card")}
        aria-label="Vue cartes"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
