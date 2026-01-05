"use client";

import { cn } from "@/lib/utils";
import { Section } from "./Section";
import { RevealGroup, RevealItem } from "./RevealGroup";
import { UserPlus, FileSignature, Wallet } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      n: "1",
      title: "Tu crées ton compte",
      desc: "Quelques infos de base, ta structure, et tu peux déjà créer tes premiers clients.",
      icon: UserPlus,
    },
    {
      n: "2",
      title: "Tu émets ton premier devis",
      desc: "Tu définis ton client, tes prestations, tes prix. Le PDF est généré automatiquement.",
      icon: FileSignature,
    },
    {
      n: "3",
      title: "Tu suis tes paiements sereinement",
      desc: "Tu vois ce qui est payé, en retard, à relancer. Tu gardes le contrôle sans y passer tes soirées.",
      icon: Wallet,
    },
  ];

  return (
    <Section
      id="how-it-works"
      name="Comment ça marche ?"
      title="Comment ça se passe concrètement ?"
      subtitle="On est là pour vous accompagner."
      headerAlign="left"
      className="cursor-default"
    >
      <RevealGroup delay={0.05} stagger={0.1} amount={0.25} once>
        {/* Timeline wrapper */}
        <div className="mt-6">
          {/* Desktop line */}
          <RevealItem y={10} duration={0.45}>
            <div className="hidden md:block relative">
              <div className="absolute left-0 right-0 top-5 h-px bg-border" />
              <div className="grid grid-cols-3 gap-6">
                {steps.map((s) => {
                  const Icon = s.icon;
                  return (
                    <RevealItem key={s.n} y={14} duration={0.45}>
                      <div className="relative group">
                        {/* Node */}
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border",
                              "border-emerald-500/30 bg-emerald-500/10",
                              "text-emerald-600 dark:text-emerald-300",
                              "transition group-hover:bg-emerald-500/20"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <span
                            className={cn(
                              "inline-flex h-6 items-center rounded-full border px-2 text-[10px] font-medium",
                              "border-border bg-muted text-foreground"
                            )}
                          >
                            Étape {s.n}
                          </span>
                        </div>

                        {/* Card */}
                        <div
                          className={cn(
                            "mt-4 rounded-2xl border p-4",
                            "border-border bg-card/70",
                            "transition will-change-transform",
                            "hover:-translate-y-0.5 hover:bg-card"
                          )}
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {s.title}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    </RevealItem>
                  );
                })}
              </div>
            </div>
          </RevealItem>

          {/* Mobile vertical timeline */}
          <div className="md:hidden">
            <RevealGroup className="space-y-4" delay={0.02} stagger={0.08} amount={0.3} once>
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isLast = idx === steps.length - 1;

                return (
                  <RevealItem key={s.n} y={14} duration={0.45}>
                    <div className="relative pl-10">
                      {/* Vertical line */}
                      <div
                        className={cn(
                          "absolute left-[18px] top-10 w-px bg-border",
                          isLast ? "h-0" : "h-[calc(100%-16px)]"
                        )}
                      />

                      {/* Node */}
                      <div
                        className={cn(
                          "absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border",
                          "border-emerald-500/30 bg-emerald-500/10",
                          "text-emerald-600 dark:text-emerald-300"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div
                        className={cn(
                          "rounded-2xl border p-4",
                          "border-border bg-card/70"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">
                            {s.title}
                          </p>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              "border-border bg-muted text-foreground"
                            )}
                          >
                            {s.n}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </div>
        </div>
      </RevealGroup>
    </Section>
  );
}
