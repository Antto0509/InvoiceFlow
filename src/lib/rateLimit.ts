import { NextResponse } from "next/server";

/**
 * Sliding-window in-memory rate limiter.
 *
 * Limites par clé (ex: `userId:endpoint`). Chaque instance de fonction
 * maintient son propre compteur — suffisant pour une architecture single-node
 * ou Vercel Functions avec trafic modéré. Pour du multi-région à fort trafic,
 * remplacer `store` par Upstash Redis.
 */

type Entry = { timestamps: number[] };

const store = new Map<string, Entry>();

/**
 * Vérifie si la clé est sous la limite.
 * @returns `true` si la requête est autorisée, `false` si rate-limitée
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  // Éviction des timestamps hors fenêtre
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= max) {
    store.set(key, entry);
    return false;
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  return true;
}

/**
 * Réponse HTTP 429 standardisée avec header Retry-After.
 */
export function rateLimitResponse(retryAfterSec = 60): NextResponse {
  return NextResponse.json(
    { ok: false, error: { code: "rate_limited", message: "Trop de requêtes, réessayez plus tard." } },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
  );
}
