"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import type { ElementType, ReactNode } from "react";

type SectionRevealProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;

  delay?: number;
  duration?: number;
  y?: number;

  once?: boolean;
  amount?: number;

  staggerChildren?: number; // 0 = pas de stagger
  motionProps?: MotionProps; // override si besoin
};

export function SectionReveal<T extends ElementType = "div">({
  as,
  children,
  className,

  delay = 0,
  duration = 0.5,
  y = 24,

  once = true,
  amount = 0.2,

  staggerChildren = 0,
  motionProps,
}: SectionRevealProps<T>) {
  const reduceMotion = useReducedMotion();
  const Comp: ElementType = as ?? "div";

  if (reduceMotion) {
    return <Comp className={cn(className)}>{children}</Comp>;
  }

  const variants =
    staggerChildren > 0
      ? {
          hidden: { opacity: 0, y },
          show: {
            opacity: 1,
            y: 0,
            transition: {
              duration,
              delay,
              staggerChildren,
            },
          },
        }
      : undefined;

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      transition={staggerChildren > 0 ? undefined : { duration, delay }}
      variants={variants}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
