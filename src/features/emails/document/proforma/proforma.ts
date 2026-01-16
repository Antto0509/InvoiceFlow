type ProformaEmailSubjectParams = {
    document: { number: string | null };
    company: { name: string };
};

export const proformaEmailTemplate = {
    kind: "proforma",
    subject: ({ document, company }: ProformaEmailSubjectParams) =>
        `Proforma ${document.number} – ${company.name}`,
};