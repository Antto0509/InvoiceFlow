import { DocumentKind } from "@/features/documents";
import { creditNoteEmailTemplate } from "./credit_note/credit_note";
import { invoiceEmailTemplate } from "./invoice/invoice";
import { proformaEmailTemplate } from "./proforma/proforma";
import { quoteEmailTemplate } from "./quote/quote";
import { reminderOverdueEmailTemplate } from "./reminder_overdue/reminder_overdue";

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
    invoiceEmailTemplate.subject({
      document: { number: v.document.number ?? "" },
      company: v.company,
    }),

  quote: (v: EmailVars) =>
    quoteEmailTemplate.subject({
      document: { number: v.document.number ?? "" },
      company: v.company,
    }),

  credit_note: (v: EmailVars) =>
    creditNoteEmailTemplate.subject({
      document: { number: v.document.number ?? "" },
      company: v.company,
    }),

  proforma: (v: EmailVars) =>
    proformaEmailTemplate.subject({
      document: { number: v.document.number ?? "" },
      company: v.company,
    }),

  reminder_overdue: (v: EmailVars) =>
    reminderOverdueEmailTemplate.subject({
      document: { number: v.document.number ?? "" },
      company: v.company,
    }),
};

export type EmailKind = keyof typeof emailSubjects;