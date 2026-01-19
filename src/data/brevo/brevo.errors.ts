/**
 * Erreur personnalisée pour les erreurs de l'API Brevo.
 * @param status Code de statut HTTP de l'erreur.
 * @param path Chemin de l'API où l'erreur s'est produite.
 * @param payload Charge utile de la réponse d'erreur.
 */
export class BrevoApiError extends Error {
  status: number;
  path: string;
  payload: unknown;

  constructor(args: { status: number; path: string; payload: unknown }) {
    super(`Brevo API error ${args.status} on ${args.path}`);
    this.status = args.status;
    this.path = args.path;
    this.payload = args.payload;
  }
}
