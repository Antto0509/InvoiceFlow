"use client";

import * as React from "react";
import { useMotionValue } from "framer-motion";

/**
 * Hook pour obtenir une valeur motion du scrollY de la fenêtre
 * @returns {MotionValue<number>}
 */
export function useWindowScrollY() {
  const scrollY = useMotionValue(0);

  React.useEffect(() => {
    let raf = 0;

    // mise à jour du scrollY
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        scrollY.set(window.scrollY || 0);
      });
    };

    // set initial
    update();

    window.addEventListener("scroll", update, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(raf);
    };
  }, [scrollY]);

  return scrollY;
}