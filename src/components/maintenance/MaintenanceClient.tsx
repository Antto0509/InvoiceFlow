"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Hammer, Home, Sparkles } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function MaintenanceClient({
  homeHref,
  title = "Page en construction",
  subtitle = "On remet les outils en place. Revenez dans un instant.",
  badge = "EN TRAVAUX",
}: {
  homeHref: string;
  title?: string;
  subtitle?: string;
  badge?: string;
}) {
  const [progress, setProgress] = React.useState(12);

  React.useEffect(() => {
    // fake progress “qui avance” sans finir (classique mais efficace)
    const t = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 8;
        return next >= 92 ? 92 : next;
      });
    }, 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background: paper + noise + subtle grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%2240%22 height=%2240%22 filter=%22url(%23n)%22 opacity=%220.55%22/%3E%3C/svg%3E')",
          }}
        />
        <div className="
            absolute inset-0 opacity-[0.12] 
            bg-[linear-gradient(to_right,rgba(0,0,0,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.22)_1px,transparent_1px)] 
            dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.22)_1px,transparent_1px)] 
            bg-size-[36px_36px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
            >
              <Hammer className="h-4 w-4" />
              <span>Maintenance — section en cours</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.06, ease: "easeOut" }}
              className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
              className="mt-4 max-w-xl text-pretty text-base text-muted-foreground"
            >
              {subtitle}
            </motion.p>

            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
              className="mt-8 max-w-xl"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Préparation des éléments</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full border bg-foreground/3">
                <motion.div
                  className="h-full bg-foreground/20"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={homeHref}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium",
                    "hover:bg-foreground/5 transition"
                  )}
                >
                  <Home className="h-4 w-4" />
                  Revenir au point de départ
                </Link>

                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background",
                    "hover:opacity-90 transition"
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Revenir en arrière
                </button>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Si le problème persiste, rafraîchissez la page ou revenez plus tard.
              </p>
            </motion.div>
          </div>

          {/* Right: “Work order” card */}
          <motion.div
            initial={{ opacity: 0, y: 18, rotate: 1.2 }}
            animate={{ opacity: 1, y: 0, rotate: 1.2 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative"
          >
            {/* Floating stamp */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, rotate: 9 }}
              animate={{ opacity: 1, scale: 1, rotate: 9 }}
              transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
              className="absolute -top-6 right-6 z-20"
            >
              <div className="select-none rounded-md border bg-background/70 px-4 py-2 backdrop-blur">
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Tampon
                </div>
                <motion.div
                  animate={{ y: [0, -2, 0], rotate: [0, -0.8, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="mt-1 text-lg font-bold tracking-tight"
                >
                  {badge}
                </motion.div>
              </div>
            </motion.div>

            <div className="relative rounded-2xl border bg-background/70 p-6 shadow-sm backdrop-blur">
              {/* punch / binder margin */}
              <div className="absolute left-0 top-0 h-full w-3 rounded-l-2xl bg-foreground/5" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Bon d’intervention
                  </div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">
                    Opération : mise à jour
                  </div>
                </div>

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-xl border bg-background p-3"
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
              </div>

              <div className="mt-6 grid gap-3">
                <Row label="Statut" value="En cours" />
                <Row label="Impact" value="Navigation limitée" />
                <Row label="Action" value="Revenir au menu / patienter" />
              </div>

              <div className="mt-6 rounded-xl border bg-foreground/3 p-4">
                <div className="text-sm font-medium">Info</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Certaines sections peuvent être temporairement indisponibles pendant le déploiement.
                </div>
              </div>
            </div>

            {/* Big “EN TRAVAUX” behind */}
            <div className="pointer-events-none absolute -bottom-10 -right-6 select-none text-[80px] font-black leading-none tracking-tighter text-foreground/10 sm:text-[96px]">
              WORK
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
