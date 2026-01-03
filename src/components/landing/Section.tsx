import React from "react";
import { cn } from "@/lib/utils";
import { SectionReveal } from "./SectionReveal";

type SectionProps = {
  id?: string;
  name?: string;
  title?: string;
  subtitle?: string;

  children: React.ReactNode;

  className?: string;
  containerClassName?: string;

  headerAlign?: "center" | "left";
  variant?: "default" | "muted" | "none";

  reveal?: boolean;
  revealDelay?: number;
};

const SECTION_VARIANTS: Record<NonNullable<SectionProps["variant"]>, string> = {
  default: "border-b border-border bg-background",
  muted: "border-b border-border bg-muted/30",
  none: "",
};

export function Section({
  id,
  name,
  title,
  subtitle,
  children,

  className,
  containerClassName = "mx-auto max-w-6xl px-4 py-16",

  headerAlign = "center",
  variant = "default",

  reveal = true,
  revealDelay = 0,
}: SectionProps) {
  const hasHeader = Boolean(name || title || subtitle);

  const header = hasHeader ? (
    <div
      className={cn(
        "mb-10 space-y-3",
        headerAlign === "center" ? "text-center" : "text-left max-w-2xl"
      )}
    >
      {name ? (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
          {name}
        </p>
      ) : null}

      {title ? (
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
      ) : null}

      {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  ) : null;

  return (
    <section id={id} className={cn("scroll-mt-24", SECTION_VARIANTS[variant], className)}>
      <div className={cn(containerClassName)}>
        {header
          ? reveal
            ? <SectionReveal delay={revealDelay}>{header}</SectionReveal>
            : header
          : null}

        {children}
      </div>
    </section>
  );
}
