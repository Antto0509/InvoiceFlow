import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { LandingClient } from "@/components/landing";

export const metadata: Metadata = {
  title: "Logiciel de facturation simple pour freelances",
  description:
    `${APP_NAME} : créez des factures, devis et avoirs en quelques clics. PDF propres, suivi des paiements, relances, multi-devises.`,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${APP_NAME} — Logiciel de facturation simple`,
    description:
      "Factures, devis, avoirs : PDF, paiements, relances. Une app pensée pour aller vite et rester carré.",
    url: "/",
  },
  twitter: {
    title: `${APP_NAME} — Facturation simple`,
    description:
      "Factures, devis, avoirs : PDF, paiements, relances. Une app pensée pour aller vite et rester carré.",
  },
};

export default function HomePage() {
  return (
    <LandingClient />
  );
}
