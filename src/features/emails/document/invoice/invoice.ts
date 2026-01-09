type InvoiceEmailSubjectParams = {
  document: { number: string | number };
  company: { name: string };
};

export const invoiceEmailTemplate = {
  kind: "invoice",
  subject: ({ document, company }: InvoiceEmailSubjectParams) =>
    `Facture ${document.number} – ${company.name}`,
};
