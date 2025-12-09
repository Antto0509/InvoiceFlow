// src/features/documents/schemas/pdf.schema.ts
import { z } from "zod";
import { zUuid, zDateYMD } from "@/lib/zod";
import {
  DocumentDbSchema,
  DocumentLinesDbSchema,
} from "@/schemas/documents.schema";
import { clientWithDetailsSchema } from "@/schemas/clients.schema";
import { companyWithDetailsSchema } from "@/schemas/companies.schema";
import { settingsSchema } from "@/schemas/settings.schema";

// ---------------------------------------------------------------------------
// 1) View-model pour le PDF
// ---------------------------------------------------------------------------

/** Bloc "entité" affiché dans le PDF (client / émetteur) */
export const pdfPartySchema = z.object({
  label: z.string().optional().nullable().describe("Label du bloc (ex: Client, Émetteur)"),
  name: z.string().optional().nullable().describe("Nom de la personne ou de la structure"),
  company: z.string().optional().nullable().describe("Raison sociale"),
  address: z.string().optional().nullable().describe("Adresse multi-lignes"),
  email: z.string().optional().nullable().describe("Email principal"),
  phone: z.string().optional().nullable().describe("Téléphone principal"),
});

/** Ligne de document affichée dans le PDF */
export const pdfLineSchema = z.object({
  description: z.string().describe("Description de la ligne"),
  qty: z.number().describe("Quantité"),
  unitPrice: z.number().describe("Prix unitaire HT"),
  lineTotal: z.number().describe("Total HT de la ligne"),
});

/** Données agrégées pour le PDF d’un document (facture, devis, avoir, …) */
export const documentPdfDataSchema = z.object({
  // Meta document
  id: zUuid.describe("UUID du document"),
  kind: z.string().describe("Type de document (invoice, quote, credit_note, proforma)"),
  number: z.string().nullable().describe("Numéro visible (ex: FAC-2025-001)"),
  issueDate: zDateYMD.describe("Date d’émission (YYYY-MM-DD)"),
  dueDate: zDateYMD.nullable().describe("Date d’échéance (YYYY-MM-DD)"),
  currencyCode: z.string().describe("Code devise ISO-4217 (ex: EUR)"),

  // Parties
  issuer: pdfPartySchema.nullable().optional().describe("Entreprise émettrice"),
  client: pdfPartySchema.nullable().optional().describe("Client destinataire"),

  // Lignes
  items: z.array(pdfLineSchema).describe("Lignes du document"),

  // Totaux
  subtotal: z.number().describe("Sous-total HT"),
  tax: z.number().describe("Montant de TVA"),
  total: z.number().describe("Total TTC"),

  // Notes (mentions, conditions, etc.)
  notes: z.string().nullable().optional().describe("Notes/mentions visibles dans le PDF"),
});

export type DocumentPdfData = z.infer<typeof documentPdfDataSchema>;

// ---------------------------------------------------------------------------
// 2) Source "brute" pour la génération PDF
//    -> Document + lignes + client complet + company complète + settings
// ---------------------------------------------------------------------------

export const documentPdfSourceSchema = DocumentDbSchema.extend({
  lines: z.array(DocumentLinesDbSchema),
  clientWithDetails: clientWithDetailsSchema.nullable().optional(),
  companyWithDetails: companyWithDetailsSchema.nullable().optional(),
  settings: settingsSchema.nullable().optional(),
});

export type DocumentPdfSource = z.infer<typeof documentPdfSourceSchema>;

// ---------------------------------------------------------------------------
// 3) Helpers internes (formatage adresses & choix par défaut)
// ---------------------------------------------------------------------------

function formatAddress(parts: {
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
}) {
  const lines: string[] = [];

  if (parts.line1) lines.push(parts.line1);
  if (parts.line2) lines.push(parts.line2);
  const cityLine = [parts.postal_code, parts.city].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);
  if (parts.country) lines.push(parts.country);

  return lines.length ? lines.join("\n") : null;
}

// billing > sinon première
function pickDefaultClientAddress(src: DocumentPdfSource["clientWithDetails"]) {
  if (!src) return null;
  const addr =
    src.addresses.find((a) => a.kind === "billing") ??
    src.addresses[0];

  if (!addr) return null;

  return formatAddress({
    line1: addr.line1,
    line2: addr.line2 ?? undefined,
    postal_code: addr.postal_code ?? undefined,
    city: addr.city ?? undefined,
    country: addr.country ?? undefined,
  });
}

function pickDefaultCompanyAddress(src: DocumentPdfSource["companyWithDetails"]) {
  if (!src) return null;
  const addr =
    src.addresses.find((a) => a.kind === "billing") ??
    src.addresses[0];

  if (!addr) return null;

  return formatAddress({
    line1: addr.line1,
    line2: addr.line2 ?? undefined,
    postal_code: addr.postal_code ?? undefined,
    city: addr.city ?? undefined,
    country: addr.country ?? undefined,
  });
}

// ---------------------------------------------------------------------------
// 4) Mapper : DB (aggregée) -> view-model PDF
// ---------------------------------------------------------------------------

export function mapDocumentPdfSourceToPdfData(src: DocumentPdfSource): DocumentPdfData {
  const {
    id,
    kind,
    number,
    issue_date,
    due_date,
    currency_code,
    subtotal,
    tax,
    total,
    notes_public,
    payment_terms,
    penalty_rate,
    recovery_fee,
    clientWithDetails,
    companyWithDetails,
    settings,
  } = src;

  // ---- Émetteur (company) ----
  const company = companyWithDetails?.company;
  const issuerAddress = pickDefaultCompanyAddress(companyWithDetails ?? null);
  const issuer: DocumentPdfData["issuer"] =
    company
      ? {
          label: "Émetteur",
          name: company.name,
          company: company.name,
          address: issuerAddress,
          email: company.email ?? null,
          phone: company.phone ?? null,
        }
      : null;

  // ---- Client ----
  const cl = clientWithDetails?.client;
  const clientAddress = pickDefaultClientAddress(clientWithDetails ?? null);
  const client: DocumentPdfData["client"] =
    cl
      ? {
          label: "Client",
          name: cl.name ?? null,
          company: cl.company ?? null,
          address: clientAddress ?? cl.address ?? null,
          email: cl.email ?? null,
          phone: cl.phone ?? null,
        }
      : null;

  // ---- Lignes ----
  const items = src.lines.map((line) => ({
    description: line.description,
    qty: Number(line.qty ?? 0),
    unitPrice: Number(line.unit_price ?? 0),
    lineTotal: Number(line.line_total ?? 0),
  }));

  // ---- Notes : priorité document > settings > company ----
  const notesParts: string[] = [];

  if (notes_public) notesParts.push(notes_public);
  if (payment_terms) notesParts.push(`Conditions de paiement : ${payment_terms}`);
  if (penalty_rate != null)
    notesParts.push(`Pénalités de retard : ${penalty_rate}%`);
  if (recovery_fee)
    notesParts.push(`Indemnité forfaitaire pour frais de recouvrement applicable.`);

  const settingsLegal = settings?.legal_notes;
  if (settingsLegal) notesParts.push(settingsLegal);

  const companyLegal = company?.legal_notes;
  if (companyLegal && companyLegal !== settingsLegal) {
    notesParts.push(companyLegal);
  }

  const notes = notesParts.length ? notesParts.join("\n\n") : null;

  return {
    id,
    kind,
    number,
    issueDate: issue_date,
    dueDate: due_date,
    currencyCode: currency_code,
    issuer,
    client,
    items,
    subtotal: Number(subtotal ?? 0),
    tax: Number(tax ?? 0),
    total: Number(total ?? 0),
    notes,
  };
}
