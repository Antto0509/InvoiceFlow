import Link from "next/link";
import { cn } from "@/lib/utils";
import { PrelaunchSignupForm } from "./PrelaunchSignupForm";
import { Section } from "./Section";

export function FinalCtaSection() {
  return (
    <Section variant="default">
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
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Prêt à garder le contrôle en 2026 ?
            </h2>

            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Tu construis ton activité sur une base solide. Les outils
              traditionnels font le job, mais InvoiceFlow t’apporte la clarté
              moderne.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className={cn(
                  "rounded-lg px-4 py-2.5 text-sm font-medium transition",
                  "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                )}
              >
                Créer mon compte
              </Link>

              <a
                href="#pricing"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Voir les tarifs
              </a>
            </div>
          </div>

          {/* Waitlist */}
          <div
            className={cn(
              "rounded-2xl border p-6",
              "border-border bg-card/70"
            )}
          >
            <p className="text-sm font-semibold text-card-foreground">
              Accès anticipé
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tu veux juste être au courant dès que ça ouvre ? Mets ton email.
            </p>

            <div className="mt-4">
              <PrelaunchSignupForm ctaLabel="Me prévenir" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
