"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { PrelaunchSignupForm } from "./PrelaunchSignupForm";
import { Section } from "./Section";
import { RevealGroup, RevealItem } from "./RevealGroup";
import { ArrowRight, Mail, Sparkles } from "lucide-react";

export function FinalCtaSection() {
  return (
    <Section id="final-cta" variant="default" className="cursor-default">
      <RevealGroup delay={0.05} stagger={0.1} amount={0.25} once>
        <RevealItem y={12} duration={0.5}>
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl border p-8 md:p-10",
              "border-border bg-background"
            )}
          >
            {/* Gradient / glow */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0",
                "bg-linear-to-b from-muted/40 via-background to-background"
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

            <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
              {/* Texte */}
              <RevealGroup delay={0.0} stagger={0.08} amount={0.35} once>
                <div>
                  <RevealItem y={10} duration={0.45}>
                    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                      <Sparkles className="h-4 w-4" />
                      Dernière ligne droite
                    </div>
                  </RevealItem>

                  <RevealItem y={14} duration={0.5}>
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                      Prêt à garder le contrôle en 2026 ?
                    </h2>
                  </RevealItem>

                  <RevealItem y={12} duration={0.5}>
                    <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                      Tu construis ton activité sur une base solide. Les outils
                      traditionnels font le job, mais InvoiceFlow t’apporte la clarté
                      moderne.
                    </p>
                  </RevealItem>

                  <RevealItem y={10} duration={0.45}>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        href="/register"
                        className={cn(
                          "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition",
                          "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                        )}
                      >
                        Créer mon compte
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      <a
                        href="#pricing"
                        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        Voir les tarifs
                      </a>
                    </div>
                  </RevealItem>
                </div>
              </RevealGroup>

              {/* Waitlist */}
              <RevealItem y={14} duration={0.5}>
                <div
                  className={cn(
                    "group rounded-2xl border p-6",
                    "border-border bg-card/70",
                    "transition will-change-transform",
                    "hover:-translate-y-0.5 hover:bg-card"
                  )}
                >
                  <div className={cn("flex items-center gap-2")}>
                    <span className={cn(
                      "flex h-8 w-8 items-center justify-center",
                      "rounded-lg border border-emerald-500/30", 
                      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
                      "transition group-hover:bg-emerald-500/20"
                      )}>
                      <Mail className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-semibold text-card-foreground">
                      Accès anticipé
                    </p>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Tu veux juste être au courant dès que ça ouvre ? Mets ton email.
                  </p>

                  <div className="mt-4">
                    <PrelaunchSignupForm ctaLabel="Me prévenir" />
                  </div>
                </div>
              </RevealItem>
            </div>
          </div>
        </RevealItem>
      </RevealGroup>
    </Section>
  );
}
