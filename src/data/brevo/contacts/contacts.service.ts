import { brevoFetch } from "../brevo.client";
import { BrevoContactInputSchema, type BrevoContactInput } from "./contacts.schemas";

/**
 * Upsert (crée ou met à jour) un contact dans Brevo.
 * @param input Données du contact à upserter.
 * @returns L'ID du contact créé ou mis à jour.
 */
export async function upsertBrevoContact(input: BrevoContactInput) {
  const payload = BrevoContactInputSchema.parse(input);

  // Brevo: POST /contacts (avec updateEnabled=true => upsert)
  return brevoFetch<{ id?: number }>("/contacts", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      updateEnabled: payload.updateEnabled ?? true,
    }),
  });
}

/**
 * Récupère un contact Brevo par son email.
 * @param email Email du contact à récupérer.
 * @returns Les données du contact.
 */
export async function getBrevoContact(email: string) {
  return brevoFetch<BrevoContactInput>(`/contacts/${encodeURIComponent(email)}`, {
    method: "GET",
  });
}
