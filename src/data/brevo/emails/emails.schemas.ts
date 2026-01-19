/**
 * Input pour l'envoi d'un email transactionnel via Brevo.
 */
export type SendBrevoTransacEmailInput = {
  templateId?: number; // ID du template à utiliser
  tags?: string[];  // Tags pour catégoriser l'email
  replyTo?: { email: string; name?: string }; // Adresse de réponse
  sender: { email: string; name: string, id?: number }; // Adresse de l'expéditeur
  to: Array<{ email: string; name?: string }>;  // Destinataires principaux
  cc?: Array<{ email: string; name?: string }>; // Destinataires en copie
  bcc?: Array<{ email: string; name?: string }>;  // Destinataires en copie cachée
  subject: string;  // Sujet de l'email
  scheduleAt?: string;  // UTC date-time when the email should be sent (format: YYYY-MM-DDTHH:mm:ss.SSSZ)
  htmlContent?: string; // Contenu HTML de l'email
  textContent?: string; // Contenu texte de l'email
  attachment?: Array< 
    | { url: string; name: string }   // URL de l'attachement
    | { content: string; name: string }   // Contenu encodé en base64
  >;
  headers?: Record<string, string>; // En-têtes personnalisés
};

/**
 * Response de l'envoi d'un email transactionnel via Brevo.
 */
export type SendBrevoTransacEmailResponse = {
  messageId?: string;
  messageIds?: string[];
};