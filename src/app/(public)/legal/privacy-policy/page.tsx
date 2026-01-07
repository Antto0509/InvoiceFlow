import type { Metadata } from "next";
import { LegalBox, LegalPage, LegalSection } from "@/components/legal/";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité d’InvoiceFlow (Reelium – EI) : données collectées, finalités, droits RGPD, conservation, sécurité.",
  alternates: { canonical: "/legal/privacy-policy" },
  robots: { index: true, follow: true },
};

const toc = [
  { id: "responsable", label: "Responsable du traitement" },
  { id: "donnees", label: "Données collectées" },
  { id: "finalites", label: "Finalités" },
  { id: "base-legale", label: "Base légale" },
  { id: "prestataires", label: "Sous-traitants" },
  { id: "transferts", label: "Transferts hors UE" },
  { id: "conservation", label: "Conservation" },
  { id: "securite", label: "Sécurité" },
  { id: "droits", label: "Vos droits (RGPD)" },
  { id: "cookies", label: "Cookies" },
  { id: "modifs", label: "Mises à jour" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      badge="RGPD & données personnelles"
      description="On collecte le minimum, on sécurise, et tu gardes le contrôle."
      updatedAt="7 janvier 2026"
      toc={toc}
    >
      <LegalBox>
        <strong>InvoiceFlow</strong> est édité par <strong>Reelium (EI)</strong>. Cette page
        décrit comment vos données sont traitées dans le cadre du service.
      </LegalBox>

      <LegalSection id="responsable" title="1. Responsable du traitement">
        <p>
          <strong className="text-foreground">Reelium</strong> (Entreprise Individuelle) — 99197195300013 / 134 rue Saint-Maurice, 80080 Amiens, France
        </p>
        <p>
          Contact :{" "}
          <a className="underline underline-offset-4" href="mailto:coutreelantoine@gmail.com">
            coutreelantoine@gmail.com
          </a>
        </p>
      </LegalSection>

      <LegalSection id="donnees" title="2. Données collectées">
        <ul className="list-disc space-y-1 pl-5">
          <li>Données fournies : nom/prénom, email, données métier (entreprises, clients, documents, paramètres)</li>
          <li>Données techniques : IP (sécurité/logs), sessions, cookies techniques indispensables</li>
        </ul>
      </LegalSection>

      <LegalSection id="finalites" title="3. Finalités">
        <ul className="list-disc space-y-1 pl-5">
          <li>Fournir le service et ses fonctionnalités</li>
          <li>Sécurité (auth, anti-abus, logs)</li>
          <li>Support et communications liées au compte</li>
          <li>Amélioration du produit</li>
          <li>Respect des obligations légales</li>
        </ul>
      </LegalSection>

      <LegalSection id="base-legale" title="4. Base légale">
        <ul className="list-disc space-y-1 pl-5">
          <li>Exécution du contrat</li>
          <li>Intérêt légitime (sécurité, amélioration, prévention fraude)</li>
          <li>Obligations légales</li>
        </ul>
      </LegalSection>

      <LegalSection id="prestataires" title="5. Destinataires et sous-traitants">
        <p>
          Les données peuvent être traitées par des prestataires techniques nécessaires au
          fonctionnement (hébergement, base de données, emailing transactionnel, etc.).
          Exemple : 
          <strong className="text-foreground">Vercel Inc.</strong> et 
          <strong className="text-foreground">Supabase Inc.</strong>.
        </p>
      </LegalSection>

      <LegalSection id="transferts" title="6. Transferts hors UE">
        <p>
          Certains prestataires peuvent être situés hors UE. Dans ce cas, Reelium s’assure de
          garanties appropriées (ex. clauses contractuelles types) conformément au RGPD.
        </p>
      </LegalSection>

      <LegalSection id="conservation" title="7. Durées de conservation">
        <ul className="list-disc space-y-1 pl-5">
          <li>Compte & données métier : durée d’activité du compte puis suppression/anonymisation sur demande, sauf obligation légale</li>
          <li>Logs de sécurité : 12 mois</li>
          <li>Obligations légales : conservation selon durées légales applicables</li>
        </ul>
      </LegalSection>

      <LegalSection id="securite" title="8. Sécurité">
        <p>
          Mesures techniques et organisationnelles : contrôles d’accès, chiffrement en transit,
          sauvegardes, surveillance.
        </p>
      </LegalSection>

      <LegalSection id="droits" title="9. Vos droits (RGPD)">
        <p>
          Droits : accès, rectification, suppression, limitation, opposition, portabilité.
        </p>
        <p>
          Pour exercer vos droits :{" "}
          <a className="underline underline-offset-4" href="mailto:coutreelantoine@gmail.com">
            coutreelantoine@gmail.com
          </a>. Vous pouvez aussi saisir la <strong className="text-foreground">CNIL</strong>.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="10. Cookies">
        <p>
          Cookies techniques nécessaires (session, sécurité). Une politique cookies dédiée sera
          ajoutée si des outils de mesure/audience sont activés.
        </p>
      </LegalSection>

      <LegalSection id="modifs" title="11. Modification de la politique">
        <p>
          Cette politique peut évoluer. La date de mise à jour sera affichée en haut de page.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
