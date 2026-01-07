"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function LandingBackground() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        setOffset(window.scrollY);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // coefficients faibles = mouvement lent (clé du rendu premium)
  const glowFast = offset * 0.15;
  const glowSlow = offset * 0.07;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* gradient global */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-linear-to-b from-muted/40 via-background to-background",
          "dark:from-background dark:via-background dark:to-background"
        )}
      />

      {/* glow haut droite */}
      <div
        className={cn(
          "absolute -top-24 right-[-120px] h-72 w-72 rounded-full blur-3xl",
          "bg-emerald-500/15 dark:bg-emerald-500/10",
          "will-change-transform"
        )}
        style={{
          transform: `translateY(${glowSlow}px)`,
        }}
      />

      {/* glow bas gauche */}
      <div
        className={cn(
          "absolute -bottom-28 left-[-120px] h-72 w-72 rounded-full blur-3xl",
          "bg-emerald-500/10 dark:bg-emerald-500/5",
          "will-change-transform"
        )}
        style={{
          transform: `translateY(${-glowFast}px)`,
        }}
      />

      {/* grain / grid subtil */}
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
