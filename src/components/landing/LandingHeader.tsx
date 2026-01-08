"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useScrollSpy, useWindowScrollY } from "@/hooks/index";

const NAV = [
  { href: "#features" as const, label: "Fonctionnalités" },
  { href: "#how-it-works" as const, label: "Comment ça marche" },
  { href: "#pricing" as const, label: "Tarifs" },
  { href: "#faq" as const, label: "FAQ" },
];

export function LandingHeader() {
  // ref sur le header complet (barre + dropdown)
  const headerRef = React.useRef<HTMLElement>(null);

  // scrollY fiable (mobile inclus)
  const scrollY = useWindowScrollY();

  // animation on scroll
  const tRaw = useTransform(scrollY, [0, 80], [0, 1]);
  const t = useSpring(tRaw, { stiffness: 300, damping: 30 });

  const padY = useTransform(t, [0, 1], [16, 8]);
  const radius = useTransform(t, [0, 1], [12, 16]);
  const y = useTransform(t, [0, 1], [0, 10]);
  const scale = useTransform(t, [0, 1], [1, 0.98]);
  const shadowOpacity = useTransform(t, [0, 1], [0, 1]);

  const [open, setOpen] = React.useState(false);

  // offset dynamique basé sur la hauteur réelle du header
  const [headerOffsetPx, setHeaderOffsetPx] = React.useState(96);

  React.useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => {
      const h = el.getBoundingClientRect().height;
      setHeaderOffsetPx(Math.max(0, Math.ceil(h)));
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // ✅ ScrollSpy: rootMargin basé sur la hauteur du header (fixed)
  // IMPORTANT: memoize l'objet options sinon le hook re-run tout le temps
  const spyOptions = React.useMemo(() => {
    const top = Math.ceil(headerOffsetPx + 12); // header + petit "air"
    // On considère une section active quand elle arrive sous le header.
    // Bottom garde une zone pour éviter que la section suivante ne prenne trop tôt.
    return {
      rootMargin: `-${top}px 0px -60% 0px`,
      threshold: [0.1, 0.25, 0.4, 0.6] as number[],
    };
  }, [headerOffsetPx]);

  const active = useScrollSpy(NAV, spyOptions);

  // micro pulse CTA : seulement en haut
  const [pulse, setPulse] = React.useState(false);
  React.useEffect(() => {
    const unsub = scrollY.on("change", (v) => {
      setPulse(v < 40);
    });
    return () => unsub();
  }, [scrollY]);

  // close menu on hash change
  React.useEffect(() => {
    const onHashChange = () => setOpen(false);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const [pendingHash, setPendingHash] = React.useState<string | null>(null);

  const scrollToHash = React.useCallback(
    (hash: string) => {
      const el = document.querySelector(hash) as HTMLElement | null;
      if (!el) return;

      const extra = 12;

      // hauteur "live" au moment du scroll
      const liveHeaderOffset =
        headerRef.current?.getBoundingClientRect().height ?? headerOffsetPx;

      const top =
        el.getBoundingClientRect().top +
        (window.scrollY || 0) -
        Math.ceil(liveHeaderOffset) -
        extra;

      const prefersReduced =
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

      window.scrollTo({
        top,
        behavior: prefersReduced ? "auto" : "smooth",
      });

      // URL clean sans jump (pas de navigation, juste l’URL)
      history.pushState(null, "", hash);
    },
    [headerOffsetPx]
  );

  const isDesktop = React.useCallback(() => {
    return window.matchMedia?.("(min-width: 768px)")?.matches ?? true;
  }, []);

  const onNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // ✅ desktop: pas de dropdown animé -> scroll direct
    if (isDesktop()) {
      setOpen(false);
      requestAnimationFrame(() => scrollToHash(href));
      return;
    }

    // ✅ mobile: on attend la fermeture animée
    setPendingHash(href);
    setOpen(false);
  };

  return (
    <header className="fixed top-0 z-20 w-full pt-2">
      <motion.div style={{ y }} className="px-3 md:px-4">
        <motion.header
          ref={headerRef}
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
          {/* Top bar */}
          <motion.div
            style={{ paddingTop: padY, paddingBottom: padY }}
            className="px-3 md:px-4"
          >
            <div className="flex items-center justify-between gap-3">
              {/* Brand */}
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/favicon.ico"
                  alt="InvoiceFlow Logo"
                  className="rounded"
                  width={32}
                  height={32}
                />
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  InvoiceFlow
                </span>
              </Link>

              {/* Desktop nav */}
              <nav className="relative hidden items-center gap-2 text-sm md:flex">
                {NAV.map((item) => {
                  const isActive = active === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => onNavClick(e, item.href)}
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
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 40,
                          }}
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

                {/* CTA desktop */}
                <motion.div
                  animate={pulse ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                  transition={{
                    duration: 1.2,
                    repeat: pulse ? Infinity : 0,
                    repeatDelay: 2,
                  }}
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

                {/* Mobile menu button */}
                <Button
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
                </Button>
              </div>
            </div>

            {/* Dynamic shadow */}
            <motion.div
              aria-hidden
              style={{ opacity: shadowOpacity }}
              className="pointer-events-none -mt-px h-px bg-transparent shadow-[0_12px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
            />
          </motion.div>

          {/* Mobile dropdown */}
          <motion.div
            initial={false}
            animate={open ? "open" : "closed"}
            variants={{
              open: { height: "auto", opacity: 1 },
              closed: { height: 0, opacity: 0 },
            }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden md:hidden"
            onAnimationComplete={(state) => {
              // ✅ seulement à la fin de la fermeture
              if (state !== "closed") return;
              if (!pendingHash) return;

              // double rAF = laisse le layout + ResizeObserver respirer
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  scrollToHash(pendingHash);
                  setPendingHash(null);
                });
              });
            }}
          >
            <div className="px-3 pb-3">
              <div className="grid gap-1 rounded-xl border border-border bg-card/70 p-2">
                {NAV.map((item) => {
                  const isActive = active === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => onNavClick(e, item.href)}
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
                  onClick={() => setOpen(false)}
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
