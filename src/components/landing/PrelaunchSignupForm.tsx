"use client";

import * as React from "react";
import { cn, isValidEmail } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PrelaunchSignupForm({
  className,
  ctaLabel = "Être prévenu du lancement",
  small = false,
}: {
  className?: string;
  ctaLabel?: string;
  small?: boolean;
}) {
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState(""); // honeypot
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const clean = email.trim().toLowerCase();
    if (!isValidEmail(clean)) {
      setStatus("error");
      setMessage("Email invalide. Mets un vrai mail et on est bien.");
      return;
    }

    setStatus("loading");

    try {
      // Si honeypot rempli, on affiche "success" côté UI
      // (on évite de signaler au bot qu'il est grillé)
      if (company.trim()) {
        setStatus("success");
        setMessage("C’est noté. Tu seras prévenu au lancement 🚀");
        setEmail("");
        return;
      }

      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, company }), // <-- send honeypot
      });

      if (!r.ok) throw new Error("Request failed");

      setStatus("success");
      setMessage("C’est noté. Tu seras prévenu au lancement 🚀");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Oups. Impossible d’enregistrer. Réessaie.");
    }
  };

  const disabled = status === "loading";

  return (
    <form onSubmit={onSubmit} className={cn(className)}>
      {/* Honeypot field (hidden) */}
      <div
        className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label>
          Company
          <input
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <div
        className={cn(
          "flex w-full flex-col gap-2 sm:flex-row sm:items-center",
          small ? "sm:gap-2" : "sm:gap-3"
        )}
      >
        <Input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
            if (message) setMessage(null);
          }}
          placeholder="ton.email@exemple.com"
          className={cn(
            "w-full rounded-lg border bg-background px-3 text-foreground placeholder:text-muted-foreground outline-none cursor-text",
            "border-input focus-visible:border-emerald-500/60 focus-visible:ring-2 focus-visible:ring-emerald-500/15",
            small ? "h-9 text-sm" : "h-10 text-sm"
          )}
          inputMode="email"
          autoComplete="email"
          aria-label="Adresse email"
        />

        <Button
          type="submit"
          disabled={disabled}
          className={cn(
            "cursor-pointer inline-flex items-center justify-center rounded-lg bg-emerald-500 font-medium text-slate-950 transition",
            "hover:bg-emerald-400 disabled:opacity-60 disabled:hover:bg-emerald-500",
            small ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm"
          )}
        >
          {status === "loading" ? "Enregistrement..." : ctaLabel}
        </Button>
      </div>

      {message ? (
        <p
          className={cn(
            "mt-2 text-xs",
            status === "success"
              ? "text-emerald-600 dark:text-emerald-300"
              : "text-destructive"
          )}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}

      <p className="mt-2 text-[11px] text-muted-foreground">
        Pas de spam. Juste un mail le jour où ça sort. Tradition : on respecte
        les boîtes mail.
      </p>
    </form>
  );
}
