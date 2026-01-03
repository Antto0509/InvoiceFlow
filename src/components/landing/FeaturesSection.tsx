import { cn } from "@/lib/utils";
import { Section } from "./Section";

export function FeaturesSection() {
  const features = [
    {
      title: "Clients & contacts",
      desc: "Tous tes clients, adresses et contacts au même endroit. Fini les infos perdues dans des fichiers Excel ou des mails.",
    },
    {
      title: "Devis, factures, avoirs",
      desc: "Création rapide, numérotation propre, PDF prêts à être envoyés. Tu restes carré sans t’arracher les cheveux.",
    },
    {
      title: "Suivi des paiements simple",
      desc: "Qui a payé, qui est en retard, combien tu dois encaisser. Tu vois où tu en es, noir sur blanc.",
    },
    {
      title: "Relances",
      desc: "Relances propres, au bon moment. Tu gardes une relation pro sans courir après les gens.",
      soon: true,
    },
    {
      title: "Multi-entreprise",
      desc: "Gérer plusieurs structures sans te mélanger les pinceaux.",
      soon: true,
    },
    {
      title: "Facturation électronique",
      desc: "Préparé pour l’avenir. Tu anticipes au lieu de subir la réforme.",
      soon: true,
    },
  ];

  return (
    <Section
      id="features"
      name="Fonctionnalités"
      title="Tout ce qu’il faut pour piloter ton activité calmement."
      subtitle="Simple, fiable, sans usine à gaz."
      headerAlign="left"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className={cn(
              "group rounded-2xl border p-4 transition",
              "border-border bg-card/70 hover:bg-card"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-card-foreground">
                {f.title}
              </h3>

              {f.soon ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    "bg-muted text-muted-foreground"
                  )}
                >
                  Bientôt
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
