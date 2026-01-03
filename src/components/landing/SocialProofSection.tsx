import { cn } from "@/lib/utils";
import { Section } from "./Section";

export function SocialProofSection() {
  const stats = [
    { label: "Temps gagné", value: "≈ 2h/semaine" },
    { label: "Relances", value: "Plus carrées" },
    { label: "Vue cash", value: "En 10 secondes" },
    { label: "Docs", value: "Devis → Facture" },
  ];

  const logos = ["Freelances", "Agences", "Indépendants", "TPE"];

  return (
    <Section
      variant="default"
      reveal={false}
      containerClassName="mx-auto max-w-6xl px-4 py-10 md:py-14"
    >
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Un outil sérieux, pour des gens qui bossent pour de vrai.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Pas une usine à gaz. Pas un tableur déguisé. Juste une base solide
            pour piloter ton activité.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className={cn(
                "rounded-2xl border p-4",
                "border-border bg-card/70"
              )}
            >
              <p className="text-sm font-semibold text-card-foreground">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="text-muted-foreground">Pensé pour :</span>

        {logos.map((l) => (
          <span
            key={l}
            className={cn(
              "rounded-full border px-3 py-1",
              "border-border bg-muted/30 text-foreground/80"
            )}
          >
            {l}
          </span>
        ))}
      </div>
    </Section>
  );
}
