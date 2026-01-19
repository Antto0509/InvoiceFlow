type CreditNoteEmailSubjectParams = {
  document: { number: string | null };
  company: { name: string };
};

export const creditNoteEmailTemplate = {
  kind: "credit_note",
  subject: ({ document, company }: CreditNoteEmailSubjectParams) =>
    `Avoir ${document.number} – ${company.name}`,
};
