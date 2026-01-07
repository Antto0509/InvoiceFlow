"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function RevealGroup({
  children,
  className,
  delay = 0,
  // duration = 0.5,
  stagger = 0.08,
  once = true,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  // duration?: number;
  stagger?: number;
  once?: boolean;
  amount?: number;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={cn(className)}>{children}</div>;

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        show: {
          transition: { delayChildren: delay, staggerChildren: stagger },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  duration = 0.5,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={cn(className)}>{children}</div>;

  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration } },
      }}
    >
      {children}
    </motion.div>
  );
}
