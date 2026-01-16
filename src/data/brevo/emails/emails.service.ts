import { brevoFetch } from "../brevo.client";
import {
  SendBrevoTransacEmailInput,
  SendBrevoTransacEmailResponse,
} from "./emails.schemas";

/**
 * Envoie un email transactionnel via l'API Brevo.
 * @param input Données de l'email à envoyer.
 * @returns La réponse de l'API Brevo.
 */
export async function sendBrevoTransacEmail(
  input: SendBrevoTransacEmailInput
): Promise<SendBrevoTransacEmailResponse> {
  // Brevo: /smtp/email
  return brevoFetch<SendBrevoTransacEmailResponse>("/smtp/email", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
