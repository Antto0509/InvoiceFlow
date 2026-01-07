"use client";

import { cn } from "@/lib/utils";
import { Section } from "./Section";
import { RevealGroup, RevealItem } from "./RevealGroup";
import { Clock, Bell, Wallet, FileText, Users } from "lucide-react";

export function SocialProofSection() {
  const stats = [
    { label: "Temps gagné", value: "≈ 2h/semaine", icon: Clock },
    { label: "Relances", value: "Plus carrées", icon: Bell },
    { label: "Vue cash", value: "En 10 secondes", icon: Wallet },
    { label: "Docs", value: "Devis → Facture", icon: FileText },
  ];

  const logos = ["Freelances", "Agences", "Indépendants", "TPE"];

  return (
    <Section
      id="social-proof"
      variant="default"
      reveal={false}
      containerClassName="mx-auto max-w-6xl px-4 py-10 md:py-14 cursor-default"
    >
      {/* Reveal global du bloc */}
      <RevealGroup delay={0.05} stagger={0.08} amount={0.3} once>
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          {/* Texte */}
          <RevealItem y={12} duration={0.45}>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                Un outil sérieux, pour des gens qui bossent pour de vrai.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                Pas une usine à gaz. Pas un tableur déguisé. Juste une base solide
                pour piloter ton activité.
              </p>
            </div>
          </RevealItem>

          {/* Grille stats : stagger interne */}
          <RevealItem y={14} duration={0.5}>
            <RevealGroup
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              delay={0.0}
              stagger={0.07}
              amount={0.35}
              once
            >
              {stats.map((s) => {
                const Icon = s.icon;

                return (
                  <RevealItem key={s.label} y={12} duration={0.45}>
                    <div
                      className={cn(
                        "group rounded-2xl border p-4",
                        "border-border bg-card/70",
                        "transition will-change-transform",
                        "hover:-translate-y-0.5 hover:bg-card"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg border",
                            "border-emerald-500/30 bg-emerald-500/10",
                            "text-emerald-600 dark:text-emerald-300",
                            "transition group-hover:bg-emerald-500/20"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>

                        <p className="text-sm font-semibold text-card-foreground">
                          {s.value}
                        </p>
                      </div>

                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {s.label}
                      </p>
                    </div>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </RevealItem>
        </div>

        {/* “Pensé pour” */}
        <RevealItem y={10} duration={0.45}>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              Pensé pour :
            </span>

            {logos.map((l) => (
              <span
                key={l}
                className={cn(
                  "rounded-full border px-3 py-1",
                  "border-border bg-muted/30 text-foreground/80",
                  "transition hover:bg-muted/50"
                )}
              >
                {l}
              </span>
            ))}
          </div>
        </RevealItem>
      </RevealGroup>
    </Section>
  );
}
