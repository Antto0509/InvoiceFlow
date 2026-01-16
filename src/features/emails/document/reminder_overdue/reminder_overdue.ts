type ReminderOverdueEmailSubjectParams = {
  document: { number: string | null };
  company: { name: string };
};

export const reminderOverdueEmailTemplate = {
  kind: "reminder_overdue",
  subject: ({ document, company }: ReminderOverdueEmailSubjectParams) =>
    `Relance – Facture ${document.number} – ${company.name}`,
};