"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { PrelaunchSignupForm } from "./PrelaunchSignupForm";
import { Section } from "./Section";
import { RevealGroup, RevealItem } from "./RevealGroup"; // adapte le chemin

export function PricingSection() {
  return (
    <Section
      id="pricing"
      name="Tarification"
      title="Tarifs simples, sans surprise."
      subtitle="Les formules détaillées arrivent bientôt. Pour l’instant : accès anticipé + base gratuite pour démarrer."
      headerAlign="left"
      className="cursor-default"
    >
      <RevealGroup
        className="mt-8 grid gap-6 md:grid-cols-3"
        delay={0.05}
        stagger={0.1}
        amount={0.2}
        once
      >
        {/* FREE */}
        <RevealItem duration={0.45} y={14}>
          <div
            className={cn(
              "rounded-2xl border p-6",
              "border-border bg-card/70",
              "transition will-change-transform",
              "hover:-translate-y-0.5 hover:bg-card/90"
            )}
          >
            <p className="text-sm font-semibold text-card-foreground">Free</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pour tester et poser tes fondations.
            </p>

            <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              0 €
            </p>

            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li>• Clients</li>
              <li>• Devis & factures</li>
              <li>• PDF</li>
            </ul>

            <div className="mt-5">
              <Link
                href="/register"
                className={cn(
                  "inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition",
                  "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                )}
              >
                Commencer
              </Link>
            </div>
          </div>
        </RevealItem>

        {/* LAUNCH */}
        <RevealItem duration={0.45} y={14}>
          <div
            className={cn(
              "relative rounded-2xl border p-6",
              "border-emerald-500/40 bg-emerald-500/10",
              "transition will-change-transform",
              "hover:-translate-y-0.5 hover:bg-emerald-500/15"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">Launch</p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                )}
              >
                Recommandé
              </span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Pour ceux qui veulent être prêts dès le jour 1.
            </p>

            <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              Bientôt
            </p>

            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li>• Fonctionnalités “cœur”</li>
              <li>• Suivi paiements</li>
              <li>• Roadmap prioritaire</li>
            </ul>

            <div className="mt-5">
              <PrelaunchSignupForm ctaLabel="Être prévenu" className="max-w-md" small />
            </div>
          </div>
        </RevealItem>

        {/* PRO */}
        <RevealItem duration={0.45} y={14}>
          <div
            className={cn(
              "rounded-2xl border p-6",
              "border-border bg-card/70",
              "transition will-change-transform",
              "hover:-translate-y-0.5 hover:bg-card/90"
            )}
          >
            <p className="text-sm font-semibold text-card-foreground">Pro</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pour scaler (multi, automatisations, conformité).
            </p>

            <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              À venir
            </p>

            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li>• Relances avancées</li>
              <li>• Multi-entreprise</li>
              <li>• Facturation électronique (prépa)</li>
            </ul>

            <div className="mt-5">
              <a
                href="#waitlist"
                className={cn(
                  "inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition",
                  "border border-border bg-background text-foreground hover:bg-muted"
                )}
              >
                Rejoindre la liste
              </a>
            </div>
          </div>
        </RevealItem>
      </RevealGroup>
    </Section>
  );
}
