"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useScrollSpy } from "@/hooks/useScrollSpy";

const NAV = [
  { href: "#features" as const, label: "Fonctionnalités" },
  { href: "#how-it-works" as const, label: "Comment ça marche" },
  { href: "#pricing" as const, label: "Tarifs" },
  { href: "#faq" as const, label: "FAQ" },
];

export function LandingHeader() {
  const { scrollY } = useScroll();

  const tRaw = useTransform(scrollY, [0, 80], [0, 1]);
  const t = useSpring(tRaw, { stiffness: 300, damping: 30 });

  const padY = useTransform(t, [0, 1], [16, 8]);
  const radius = useTransform(t, [0, 1], [12, 16]);
  const y = useTransform(t, [0, 1], [0, 10]);
  const scale = useTransform(t, [0, 1], [1, 0.98]);
  const shadowOpacity = useTransform(t, [0, 1], [0, 1]);

  const [open, setOpen] = React.useState(false);

  // lien actif selon scroll
  const active = useScrollSpy(NAV);

  // micro pulse CTA : 1 fois, seulement en haut
  const [pulse, setPulse] = React.useState(false);
  React.useEffect(() => {
    const unsub = scrollY.on("change", (v) => {
      if (v < 40) setPulse(true);
      else setPulse(false);
    });
    return () => unsub();
  }, [scrollY]);

  // close on hash change
  React.useEffect(() => {
    const onHashChange = () => setOpen(false);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const onNavClick = () => setOpen(false);

  return (
    <header className="fixed top-0 z-50 w-full pt-2">
      <motion.div style={{ y }} className="px-3 md:px-4">
        <motion.header
          style={{ borderRadius: radius, scale }}
          className={cn(
            "mx-auto w-full max-w-6xl",
            "border border-border",
            "bg-background/80 backdrop-blur",
            "supports-backdrop-filter:bg-background/60",
            "transition-colors"
          )}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div style={{ paddingTop: padY, paddingBottom: padY }} className="px-3 md:px-4">
            <div className="flex items-center justify-between gap-3">
              {/* Brand */}
              <Link href="/" className="flex items-center gap-2">
                <motion.div
                  layout
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-slate-950"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  IF
                </motion.div>
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  InvoiceFlow
                </span>
              </Link>

              {/* Nav desktop + indicator animé */}
              <nav className="relative hidden items-center gap-2 text-sm md:flex">
                {NAV.map((item) => {
                  const isActive = active === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={onNavClick}
                      className={cn(
                        "relative rounded-lg px-3 py-2 transition",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-lg bg-muted"
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      ) : null}

                      <span className="relative z-10">{item.label}</span>
                    </a>
                  );
                })}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <ThemeToggle />

                <motion.div
                  animate={pulse ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                  transition={{ duration: 1.2, repeat: pulse ? Infinity : 0, repeatDelay: 2 }}
                  className="hidden md:block"
                >
                  <Link
                    href="/register"
                    className={cn(
                      "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition",
                      "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
                      "shadow-sm hover:shadow-emerald-500/20"
                    )}
                  >
                    S’inscrire
                  </Link>
                </motion.div>

                {/* Mobile menu */}
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition md:hidden",
                    "border-border bg-background hover:bg-muted text-foreground"
                  )}
                  aria-label="Ouvrir le menu"
                  aria-expanded={open}
                >
                  {open ? "✕" : "☰"}
                </button>
              </div>
            </div>

            {/* Ombre dynamique */}
            <motion.div
              aria-hidden
              style={{ opacity: shadowOpacity }}
              className="pointer-events-none -mt-px h-px bg-transparent shadow-[0_12px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
            />
          </motion.div>

          {/* Mobile dropdown (slide + fade) */}
          <motion.div
            initial={false}
            animate={open ? "open" : "closed"}
            variants={{
              open: { height: "auto", opacity: 1 },
              closed: { height: 0, opacity: 0 },
            }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden md:hidden"
          >
            <div className="px-3 pb-3">
              <div className="grid gap-1 rounded-xl border border-border bg-card/70 p-2">
                {NAV.map((item) => {
                  const isActive = active === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={onNavClick}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm transition",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </a>
                  );
                })}

                <Link
                  href="/register"
                  className={cn(
                    "mt-1 inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition",
                    "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  )}
                >
                  S’inscrire
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.header>
      </motion.div>
    </header>
  );
}
