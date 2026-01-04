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
  motionProps?: MotionProps;
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

  if (reduceMotion) {
    const Comp: ElementType = as ?? "div";
    return <Comp className={cn(className)}>{children}</Comp>;
  }

  const variants = {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition:
        staggerChildren > 0
          ? { duration, delay, staggerChildren }
          : { duration, delay },
    },
  } as const;

  const MotionComp = motion.create(as ?? "div");

  return (
    <MotionComp
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={variants}
      {...motionProps}
    >
      {children}
    </MotionComp>
  );
}
