type QuoteEmailSubjectParams = {
  document: { number: string | null };
  company: { name: string };
};

export const quoteEmailTemplate = {
  kind: "quote",
  subject: ({ document, company }: QuoteEmailSubjectParams) =>
    `Devis ${document.number} – ${company.name}`,
};