"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Home, FileWarning, Sparkles } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function NotFoundClient({ homeHref }: { homeHref: string }) {
  const auditMode = true; // toujours ON
  const glitchOn = true; // toujours ON

  const [stamp, setStamp] = React.useState<"REFUSÉ" | "INTROUVABLE" | "ARCHIVÉ">(
    "INTROUVABLE"
  );

  React.useEffect(() => {
    const stamps: Array<typeof stamp> = ["REFUSÉ", "INTROUVABLE", "ARCHIVÉ"];
    const t = setInterval(() => {
      setStamp(stamps[Math.floor(Math.random() * stamps.length)]);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-0px)] overflow-hidden bg-background text-foreground">
      {/* Background: paper + noise + grid */}
      <div className="pointer-events-none absolute inset-0">
        {/* soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_55%)]" />
        {/* grain */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%2240%22 height=%2240%22 filter=%22url(%23n)%22 opacity=%220.55%22/%3E%3C/svg%3E')",
          }}
        />

        <AnimatePresence>
          {auditMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.18 }}
              exit={{ opacity: 0 }}
              className="
                absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.25)_1px,transparent_1px)] 
                dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)]
                bg-size-[32px_32px]"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
            >
              <FileWarning className="h-4 w-4" />
              <span>Erreur 404 — page introuvable</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
              className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              Cette page a été{" "}
              <span className="relative inline-block">
                <span className="relative z-10">classée sans suite</span>
                <span className="absolute -inset-x-1 bottom-1 h-3 -skew-x-12 rounded bg-foreground/10" />
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
              className="mt-4 max-w-xl text-pretty text-base text-muted-foreground"
            >
              On a cherché dans les classeurs, les archives, même derrière la machine à café.
              Rien. Zéro. La route demandée n’existe pas (ou n’existe plus).
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href={homeHref}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium",
                  "hover:bg-foreground/5 transition"
                )}
              >
                <Home className="h-4 w-4" />
                Retour accueil
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
            </motion.div>

            {/* Texte neutre (pas adressé) */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
              className="mt-6 text-xs text-muted-foreground"
            >
              Si la page devait exister, vérifiez l’URL ou repassez par le menu principal.
            </motion.p>
          </div>

          {/* Right: the “lost invoice” card */}
          <motion.div
            initial={{ opacity: 0, y: 18, rotate: -1.2 }}
            animate={{ opacity: 1, y: 0, rotate: -1.2 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative"
          >
            {/* Floating stamp */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: -10 }}
              transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
              className="absolute -top-6 right-6 z-20"
            >
              <div className="select-none rounded-md border bg-background/70 px-4 py-2 backdrop-blur">
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Tampon
                </div>
                <div className="mt-1 text-lg font-bold tracking-tight">{stamp}</div>
              </div>
            </motion.div>

            <div className="relative rounded-2xl border bg-background/70 p-6 shadow-sm backdrop-blur">
              {/* Torn paper effect */}
              <div className="absolute left-0 top-0 h-full w-3 rounded-l-2xl bg-foreground/5" />
              <div className="absolute -left-2 top-10 h-8 w-8 rotate-12 rounded-md border bg-background" />
              <div className="absolute -left-3 top-24 h-10 w-10 -rotate-6 rounded-md border bg-background" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    InvoiceFlow
                  </div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">
                    Document introuvable
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
                <Line label="Code erreur" value="404" />
                <Line label="Statut dossier" value="Non localisé" />
                <Line label="Suggestion" value="Revenir au menu ou relancer la navigation" />
              </div>

              {/* Texte neutre */}
              <div className="mt-6 rounded-xl border bg-foreground/3 p-4">
                <div className="text-sm font-medium">Note</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Cette page sert à indiquer qu’une ressource n’est pas disponible à l’adresse demandée.
                  Vous pouvez revenir en arrière ou repartir de l’accueil.
                </div>
              </div>
            </div>

            {/* Big 404 behind (glitch controlled) */}
            <div className="pointer-events-none absolute -bottom-12 -right-6 select-none">
              <div className="relative text-[140px] font-black leading-none tracking-tighter sm:text-[180px]">
                {/* Base layer */}
                <div className="text-foreground/10">404</div>

                {/* Glitch layers */}
                <AnimatePresence>
                  {glitchOn && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 0.14,
                          x: [0, -2, 1, -1, 0],
                          y: [0, 1, -1, 2, 0],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          times: [0, 0.25, 0.5, 0.75, 1],
                        }}
                        className="absolute inset-0 text-foreground/10 blur-[0.2px]"
                        style={{ clipPath: "inset(0 0 52% 0)" }}
                        aria-hidden
                      >
                        404
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 0.12,
                          x: [0, 2, -1, 1, 0],
                          y: [0, -1, 2, -2, 0],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 1.9,
                          repeat: Infinity,
                          ease: "easeInOut",
                          times: [0, 0.2, 0.55, 0.8, 1],
                        }}
                        className="absolute inset-0 text-foreground/10 blur-[0.2px]"
                        style={{ clipPath: "inset(48% 0 0 0)" }}
                        aria-hidden
                      >
                        404
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.28, y: [-10, 140] }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute left-0 right-0 top-0 h-0.5 bg-foreground/10"
                        aria-hidden
                      />
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
