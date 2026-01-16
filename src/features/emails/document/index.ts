import { DocumentKind } from "@/features/documents";

export type EmailVars = {
  client: {
    name: string;
    email?: string | null;
  };
  company: {
    name: string;
    email?: string | null;
    website?: string | null;
    legal_notes?: string | null;
    bank_info?: string | null;
  };
  document: {
    kind: DocumentKind;
    number?: string | null;
    total: string;
    currency: string;
    issue_date?: string;
    due_date?: string | null;
    valid_until?: string;
    reference_number?: string;
    days_overdue?: number;
  };
};

export const emailSubjects = {
  invoice: (v: EmailVars) =>
    `Facture ${v.document.number ?? ""} – ${v.company.name}`.trim(),

  quote: (v: EmailVars) =>
    `Devis ${v.document.number ?? ""} – ${v.company.name}`.trim(),

  credit_note: (v: EmailVars) =>
    `Avoir ${v.document.number ?? ""} – ${v.company.name}`.trim(),

  proforma: (v: EmailVars) =>
    `Proforma ${v.document.number ?? ""} – ${v.company.name}`.trim(),

  reminder_overdue: (v: EmailVars) =>
    `Relance – Facture ${v.document.number ?? ""} – ${v.company.name}`.trim(),
};

export type EmailKind = keyof typeof emailSubjects;