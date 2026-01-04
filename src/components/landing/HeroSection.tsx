"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { PrelaunchSignupForm } from "./PrelaunchSignupForm";
import { RevealGroup, RevealItem } from "./RevealGroup"; // adapte le chemin

export function HeroSection() {
  return (
    <section
      className={cn(
        "border-b border-border",
        "bg-background",
        "relative overflow-hidden",
        "top-0 z-10 pt-10",
        'cursor-default'
      )}
    >
      {/* overlays */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-linear-to-b from-muted/40 via-background to-background",
          "dark:from-background dark:via-background dark:to-background"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -top-24 right-[-120px] h-72 w-72 rounded-full blur-3xl",
          "bg-emerald-500/15 dark:bg-emerald-500/10"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-28 left-[-120px] h-72 w-72 rounded-full blur-3xl",
          "bg-emerald-500/10 dark:bg-emerald-500/5"
        )}
      />

      <RevealGroup
        className="relative mx-auto max-w-6xl px-4 py-16 md:py-24 grid gap-10 md:grid-cols-2 md:items-center"
        delay={0.05}
        stagger={0.08}
        amount={0.35}
        once
      >
        {/* LEFT */}
        <div className="space-y-6">
          <RevealItem y={12} duration={0.45}>
            <p
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
                "dark:text-emerald-300"
              )}
            >
              Pensé pour les freelances & petites structures
            </p>
          </RevealItem>

          <RevealItem y={14} duration={0.5}>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl text-foreground">
              Gérer tes clients & factures
              <span className="block text-emerald-600 dark:text-emerald-400">
                sans te perdre dans l’administratif.
              </span>
            </h1>
          </RevealItem>

          <RevealItem y={14} duration={0.5}>
            <p className="text-sm text-muted-foreground md:text-base max-w-xl">
              InvoiceFlow centralise clients, devis, factures et relances dans une
              interface claire. Tu passes moins de temps à subir, et plus de temps
              à construire.
            </p>
          </RevealItem>

          <RevealItem y={12} duration={0.45}>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className={cn(
                  "rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition",
                  "shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                )}
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/login"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Déjà un compte ? Se connecter
              </Link>
            </div>
          </RevealItem>

          <RevealItem y={10} duration={0.45}>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Sans carte bancaire au départ
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Données hébergées en Europe
              </div>
            </div>
          </RevealItem>

          <RevealItem y={10} duration={0.45}>
            <div id="waitlist" className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">
                Accès anticipé : laisse ton email, on te ping au lancement.
              </p>
              <PrelaunchSignupForm ctaLabel="Me mettre sur la liste" />
            </div>
          </RevealItem>
        </div>

        {/* RIGHT */}
        <RevealItem y={18} duration={0.55}>
          <div
            className={cn(
              "rounded-2xl border border-border bg-card/80 p-4 shadow-xl",
              "transition will-change-transform",
              "hover:-translate-y-0.5"
            )}
          >
            <div className="rounded-xl border border-border bg-background p-4 text-xs text-foreground/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Vue d’ensemble</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-300">
                  Demo
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border bg-card px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">CA du mois (HT)</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">3 250 €</p>
                </div>
                <div className="rounded-lg border border-border bg-card px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Factures en attente</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">4</p>
                </div>
                <div className="rounded-lg border border-border bg-card px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">
                    Délai moyen de paiement
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">21 j</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground">Dernières factures</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between rounded-lg bg-card px-3 py-2">
                    <div>
                      <p className="text-xs font-medium text-foreground">FAC-2025-001</p>
                      <p className="text-[10px] text-muted-foreground">
                        Client Demo · 1 200 €
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-300">
                      Payée
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-card px-3 py-2">
                    <div>
                      <p className="text-xs font-medium text-foreground">DEV-2025-014</p>
                      <p className="text-[10px] text-muted-foreground">
                        Mission en cours · 850 €
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-700 dark:text-amber-300">
                      En attente
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <span className="text-[10px] text-muted-foreground/80">
                  Interface en cours de construction
                </span>
              </div>
            </div>
          </div>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
