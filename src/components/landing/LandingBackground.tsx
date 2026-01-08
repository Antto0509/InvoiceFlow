"use client";

import { motion, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWindowScrollY } from "@/hooks/useWindowScrollY";

export function LandingBackground() {
  const scrollY = useWindowScrollY();

  const glowFast = useTransform(scrollY, (v) => v * 0.15);
  const glowSlow = useTransform(scrollY, (v) => v * 0.07);
  const glowFastInv = useTransform(glowFast, (v) => -v);

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background")}
    >
      <div
        className={cn(
          "absolute inset-0",
          "bg-linear-to-b from-muted/40 via-background to-background",
          "dark:from-background dark:via-background dark:to-background"
        )}
      />

      <motion.div
        className={cn(
          "absolute -top-24 right-[-120px] h-72 w-72 rounded-full blur-3xl",
          "bg-emerald-500/15 dark:bg-emerald-500/10",
          "will-change-transform"
        )}
        style={{ y: glowSlow }}
      />

      <motion.div
        className={cn(
          "absolute -bottom-28 left-[-120px] h-72 w-72 rounded-full blur-3xl",
          "bg-emerald-500/10 dark:bg-emerald-500/5",
          "will-change-transform"
        )}
        style={{ y: glowFastInv }}
      />

      <div
        className={cn(
          "absolute inset-0 opacity-[0.08]",
          "bg-[linear-gradient(to_right,rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.12)_1px,transparent_1px)]",
          "bg-size-[48px_48px]",
          "dark:opacity-[0.06]"
        )}
      />
    </div>
  );
}
