"use client";

import { cn } from "@/lib/utils";
import { Section } from "./Section";
import { RevealGroup, RevealItem } from "./RevealGroup";
import {
  Users,
  FileText,
  CreditCard,
  Bell,
  Layers,
  ShieldCheck,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      title: "Clients & contacts",
      desc: "Tous tes clients, adresses et contacts au même endroit. Fini les infos perdues dans des fichiers Excel ou des mails.",
      icon: Users,
    },
    {
      title: "Devis, factures, avoirs",
      desc: "Création rapide, numérotation propre, PDF prêts à être envoyés. Tu restes carré sans t’arracher les cheveux.",
      icon: FileText,
    },
    {
      title: "Suivi des paiements simple",
      desc: "Qui a payé, qui est en retard, combien tu dois encaisser. Tu vois où tu en es, noir sur blanc.",
      icon: CreditCard,
    },
    {
      title: "Relances",
      desc: "Relances propres, au bon moment. Tu gardes une relation pro sans courir après les gens.",
      icon: Bell,
      soon: true,
    },
    {
      title: "Multi-entreprise",
      desc: "Gérer plusieurs structures sans te mélanger les pinceaux.",
      icon: Layers,
      soon: true,
    },
    {
      title: "Facturation électronique",
      desc: "Préparé pour l’avenir. Tu anticipes au lieu de subir la réforme.",
      icon: ShieldCheck,
      soon: true,
    },
  ];

  return (
    <Section
      id="features"
      name="Fonctionnalités"
      title="Tout ce qu’il faut pour piloter ton activité calmement."
      subtitle="Simple, fiable, sans usine à gaz."
      headerAlign="left"
      className="cursor-default"
    >
      <RevealGroup
        className="grid gap-6 md:grid-cols-3"
        delay={0.05}
        stagger={0.08}
        amount={0.25}
        once
      >
        {features.map((f) => {
          const Icon = f.icon;

          return (
            <RevealItem key={f.title} y={14} duration={0.45}>
              <div
                className={cn(
                  "group rounded-2xl border p-4 transition",
                  "border-border bg-card/70 hover:bg-card",
                  "hover:-translate-y-0.5 will-change-transform"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg border",
                        "border-emerald-500/30 bg-emerald-500/10",
                        "text-emerald-600 dark:text-emerald-300",
                        "transition group-hover:bg-emerald-500/20"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <h3 className="text-sm font-semibold text-card-foreground">
                      {f.title}
                    </h3>
                  </div>

                  {f.soon ? (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        "bg-muted text-muted-foreground"
                      )}
                    >
                      Bientôt
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </Section>
  );
}
