import { cn } from "@/lib/utils";
import { Section } from "./Section";

export function HowItWorksSection() {
  const steps = [
    {
      n: "1",
      title: "Tu crées ton compte",
      desc: "Quelques infos de base, ta structure, et tu peux déjà créer tes premiers clients.",
    },
    {
      n: "2",
      title: "Tu émets ton premier devis",
      desc: "Tu définis ton client, tes prestations, tes prix. Le PDF est généré automatiquement.",
    },
    {
      n: "3",
      title: "Tu suis tes paiements sereinement",
      desc: "Tu vois ce qui est payé, en retard, à relancer. Tu gardes le contrôle sans y passer tes soirées.",
    },
  ];

  return (
    <Section
      id="how-it-works"
      title="Comment ça se passe concrètement ?"
      headerAlign="left"
    >
      <div className="mt-6 grid gap-6 text-sm md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium",
                "border-border bg-muted text-foreground"
              )}
            >
              {s.n}
            </span>

            <div>
              <p className="font-medium text-foreground">{s.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
