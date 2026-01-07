"use client";

import { cn } from "@/lib/utils";
import { Section } from "./Section";
import { RevealGroup, RevealItem } from "./RevealGroup"; // adapte le chemin

export function FaqSection() {
  const faqs = [
    {
      q: "C’est pour qui ?",
      a: "Freelances, indépendants, petites structures. Si tu veux faire les choses proprement sans te noyer, c’est pour toi.",
    },
    {
      q: "Ça remplace un comptable ?",
      a: "Non. Ça remplace le chaos. Ton comptable te dira merci : infos propres, docs propres, suivi clean.",
    },
    {
      q: "Mes données sont où ?",
      a: "Objectif : hébergement en Europe. Tu construis ta boîte, pas un risque inutile.",
    },
    {
      q: "Je peux m’inscrire avant le lancement ?",
      a: "Oui. Mets ton email dans la liste d’attente, et tu reçois le message au lancement.",
    },
  ];

  return (
    <Section
      id="faq"
      name="FAQ"
      title="Des questions ?"
      subtitle="On a les réponses."
      headerAlign="left"
      className="cursor-default"
    >
      <RevealGroup
        className="mt-8 grid gap-4 md:grid-cols-2"
        delay={0.05}
        stagger={0.08}
        amount={0.2}
        once
      >
        {faqs.map((f) => (
          <RevealItem key={f.q} duration={0.45} y={14}>
            <div
              className={cn(
                "rounded-2xl border p-5",
                "border-border bg-card/70",
                "transition will-change-transform",
                "hover:-translate-y-0.5 hover:bg-card/90"
              )}
            >
              <p className="text-sm font-semibold text-card-foreground">
                {f.q}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {f.a}
              </p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
