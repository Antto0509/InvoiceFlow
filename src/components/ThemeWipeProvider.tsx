"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

type StartArgs = {
  x: number;
  y: number;
  nextTheme: "light" | "dark";
  applyTheme: () => void;
};

type WipeState =
  | null
  | {
      x: number;
      y: number;
      nextTheme: "light" | "dark";
      phase: "expand" | "fade";
      radius: number;
    };

type ThemeWipeContextValue = {
  startWipe: (args: StartArgs) => void;
};

export const ThemeWipeContext = React.createContext<ThemeWipeContextValue | null>(null);

function computeRadius(x: number, y: number) {
  // rayon jusqu’au coin le plus éloigné
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dx = Math.max(x, w - x);
  const dy = Math.max(y, h - y);
  return Math.hypot(dx, dy);
}

export function ThemeWipeProvider({ children }: { children: React.ReactNode }) {
  const applyRef = React.useRef<null | (() => void)>(null);
  const [wipe, setWipe] = React.useState<WipeState>(null);

  const startWipe = React.useCallback((args: StartArgs) => {
    // si on spam click, on ignore proprement
    if (wipe) return;

    applyRef.current = args.applyTheme;

    const radius = computeRadius(args.x, args.y);

    setWipe({
      x: args.x,
      y: args.y,
      nextTheme: args.nextTheme,
      phase: "expand",
      radius,
    });
  }, [wipe]);

  return (
    <ThemeWipeContext.Provider value={{ startWipe }}>
      {children}

      {/* Overlay */}
      <AnimatePresence>
        {wipe ? (
          <motion.div
            key="theme-wipe"
            className={[
              "pointer-events-none fixed inset-0 z-9999",
              // force les tokens du thème cible juste sur l’overlay
              wipe.nextTheme === "dark" ? "dark" : "",
              "bg-background theme-grain",
            ].join(" ")}
            initial={{
              opacity: 1,
              clipPath: `circle(0px at ${wipe.x}px ${wipe.y}px)`,
            }}
            animate={
              wipe.phase === "expand"
                ? {
                    opacity: 1,
                    clipPath: `circle(${wipe.radius}px at ${wipe.x}px ${wipe.y}px)`,
                  }
                : {
                    opacity: 0,
                    clipPath: `circle(${wipe.radius}px at ${wipe.x}px ${wipe.y}px)`,
                  }
            }
            exit={{ opacity: 0 }}
            transition={{
              // expand = “wipe”, fade = “sortie”
              duration: wipe.phase === "expand" ? 0.45 : 0.18,
              ease: wipe.phase === "expand" ? [0.2, 0.8, 0.2, 1] : "easeOut",
            }}
            onAnimationComplete={() => {
              if (!wipe) return;

              if (wipe.phase === "expand") {
                // ✅ switch le thème seulement quand l’écran est couvert
                applyRef.current?.();
                setWipe((prev) =>
                  prev ? { ...prev, phase: "fade" } : prev
                );
                return;
              }

              // fin : on nettoie
              setWipe(null);
              applyRef.current = null;
            }}
          />
        ) : null}
      </AnimatePresence>
    </ThemeWipeContext.Provider>
  );
}
