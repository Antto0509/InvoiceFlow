import { brevoEnv, assertServerOnly } from "./brevo.config";
import { BrevoApiError } from "./brevo.errors";
import { safeJson } from "@/lib/utils";

/**
 * Options pour la fonction brevoFetch.
 */
type BrevoFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

/**
 * Effectue une requête vers l'API Brevo avec les en-têtes appropriés.
 * @param path Chemin de l'API Brevo (ex: /smtp/email)
 * @param options Options de la requête (méthode, corps, etc.)
 * @returns La réponse typée de l'API Brevo.
 */
export async function brevoFetch<T>(
  path: string,
  options: BrevoFetchOptions = {}
): Promise<T> {
  assertServerOnly();

  const url = `${brevoEnv.BREVO_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": brevoEnv.BREVO_API_KEY,
      ...options.headers,
    },
    // évite des surprises Next cache
    cache: "no-store",
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    throw new BrevoApiError({
      status: res.status,
      path,
      payload: data,
    });
  }

  return data as T;
}
