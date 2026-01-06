import type { Metadata } from "next";
import { LegalBox, LegalPage, LegalSection } from "@/components/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site et de l’application InvoiceFlow, édités par Reelium (EI).",
  alternates: { canonical: "/legal/legal-notices" },
  robots: { index: true, follow: true },
};

const toc = [
  { id: "editeur", label: "Éditeur" },
  { id: "hebergement", label: "Hébergement" },
  { id: "pi", label: "Propriété intellectuelle" },
  { id: "acces", label: "Accès au service" },
  { id: "responsabilite", label: "Responsabilité" },
  { id: "droit", label: "Droit applicable" },
];

export default function LegalNoticesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      badge="Informations légales"
      description="Les infos essentielles sur l’éditeur, l’hébergement et les règles d’utilisation d’InvoiceFlow."
      updatedAt="à compléter"
      toc={toc}
    >
      <LegalBox>
        <strong>InvoiceFlow</strong> est un service édité par{" "}
        <strong>Reelium</strong> (Entreprise Individuelle).
      </LegalBox>

      <LegalSection id="editeur" title="Éditeur">
        <div className="space-y-2">
          <p>
            <span className="text-muted-foreground">Raison sociale :</span>{" "}
            <strong className="text-foreground">Reelium</strong> (EI)
          </p>
          <p>
            <span className="text-muted-foreground">Responsable :</span>{" "}
            <strong className="text-foreground">Antoine Coutreel</strong>
          </p>
          <p>
            <span className="text-muted-foreground">SIRET :</span> à compléter
          </p>
          <p>
            <span className="text-muted-foreground">Adresse :</span> à compléter
          </p>
          <p>
            <span className="text-muted-foreground">Email :</span>{" "}
            <a className="underline underline-offset-4" href="mailto:contact@invoiceflow.fr">
              contact@invoiceflow.fr
            </a>{" "}
            (à adapter)
          </p>
        </div>
      </LegalSection>

      <LegalSection id="hebergement" title="Hébergement">
        <p className="text-foreground font-medium">Vercel Inc.</p>
        <p>340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
      </LegalSection>

      <LegalSection id="pi" title="Propriété intellectuelle">
        <p>
          L’ensemble du site, de l’application et de leurs contenus (textes,
          interfaces, logos, graphismes, code, structure) est la propriété
          exclusive de Reelium, sauf mention contraire.
        </p>
        <p>
          Toute reproduction, représentation, modification ou exploitation, totale ou
          partielle, sans autorisation écrite préalable, est interdite.
        </p>
      </LegalSection>

      <LegalSection id="acces" title="Accès au service">
        <p>
          InvoiceFlow est une application accessible en ligne. Reelium s’efforce d’assurer
          une disponibilité continue, sans garantir une absence totale d’interruptions
          (maintenance, mises à jour, incidents).
        </p>
      </LegalSection>

      <LegalSection id="responsabilite" title="Responsabilité">
        <p>
          InvoiceFlow fournit des outils de gestion et de génération de documents
          (factures, devis, etc.). L’utilisateur reste seul responsable de l’exactitude
          des informations saisies et de leur conformité légale, fiscale et comptable.
        </p>
        <p>
          Reelium ne saurait être tenu responsable en cas d’erreur, d’omission ou d’usage
          non conforme du service.
        </p>
      </LegalSection>

      <LegalSection id="droit" title="Droit applicable">
        <p>
          Le présent site est soumis au droit français. En cas de litige, les tribunaux
          français seront compétents.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
