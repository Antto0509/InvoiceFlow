"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide-react";
import { useThemeWipe } from "@/hooks/useThemeWipe";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { startWipe } = useThemeWipe();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={cn("h-9 w-9", className)} />;

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      onClick={(e) => {
        const nextTheme = isDark ? "light" : "dark";

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        startWipe({
          x,
          y,
          nextTheme,
          applyTheme: () => setTheme(nextTheme),
        });
      }}
      variant="ghost"
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-lg",
        "bg-background hover:bg-muted text-foreground",
        className
      )}
      aria-label="Changer le thème"
      title="Changer le thème"
    >
      <span className="text-sm">
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </span>
    </Button>
  );
}
