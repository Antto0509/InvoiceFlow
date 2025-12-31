import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { pathToFileURL } from "node:url";

/** 
 * Type représentant un pays source depuis l'API externe
 * @returns SourceCountry
 */
export type SourceCountry = {
  iso2: string;
  iso3: string;
  code_num_3?: number;
  name_fr: string;
  name_en?: string;
  name_native?: string;
  flag?: string;
  website?: string;
  wikidata?: string;
  borders?: string; // "LVA,LTU,POL"
  // ... + plein d'autres champs (bologne, ue27, etc.)
  [k: string]: unknown;
};

/**
 * Type représentant une ligne de pays à insérer en base
 * @returns CountryRow
 */
export type CountryRow = {
  iso2: string;
  iso3: string;
  iso_numeric: number | null;
  name_fr: string;
  name_en: string | null;
  name_native: string | null;
  flag_url: string | null;
  website: string | null;
  wikidata: string | null;
  borders_iso3: string[] | null;
  extra: Record<string, unknown>;
  source_updated_at: string | null;
};

/**
 * URL de l'API publique des pays
 */
const DATA_URL =
  "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/curiexplore-pays/exports/json";

/**
 * Clés à omettre dans l’extra
 */
const EXTRA_OMIT_KEYS = [
  "iso2",
  "iso3",
  "code_num_3",
  "name_fr",
  "name_en",
  "name_native",
  "flag",
  "website",
  "wikidata",
  "borders",
] as const;

/**
 * Convertir la chaîne de caractères des borders en tableau
 * @param borders Chaîne de caractères des borders
 * @returns Tableau de codes ISO3 ou null si vide
 */
export function toBordersArray(borders?: string): string[] | null {
  if (!borders || typeof borders !== "string") return null;
  const arr = borders
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length ? arr : null;
}

/**
 * Extraire les champs supplémentaires à partir de l'objet source
 * @param obj Objet source
 * @returns Objet avec les champs supplémentaires
 */
export function pickExtra(obj: SourceCountry): Record<string, unknown> {
  const extra: Record<string, unknown> = { ...obj };

  for (const k of EXTRA_OMIT_KEYS) delete extra[k];

  return extra;
}

/**
 * Construire des rows prêtes à upserter à partir d’un chunk de données sources
 * @param chunk Tableau de pays source
 * @returns Tableau de CountryRow valides
 */
export function buildRows(chunk: SourceCountry[]): CountryRow[] {
  const mapped = chunk.map((c) => {
    const iso2 = String(c.iso2 || "").trim().toUpperCase();
    const iso3 = String(c.iso3 || "").trim().toUpperCase();
    if (iso2.length !== 2 || iso3.length !== 3) return null;

    return {
      iso2,
      iso3,
      iso_numeric: typeof c.code_num_3 === "number" ? c.code_num_3 : null,
      name_fr: String(c.name_fr || "").trim(),
      name_en: c.name_en ? String(c.name_en).trim() : null,
      name_native: c.name_native ? String(c.name_native).trim() : null,
      flag_url: c.flag ? String(c.flag).trim() : null,
      website: c.website ? String(c.website).trim() : null,
      wikidata: c.wikidata ? String(c.wikidata).trim() : null,
      borders_iso3: toBordersArray(c.borders),
      extra: pickExtra(c),
      source_updated_at: null as string | null, // widen to match CountryRow
    } satisfies CountryRow;
  });

  return mapped.filter((row): row is CountryRow => row !== null);
}

/**
 * Script principal de seed des countries
 * @returns Promise<void>
 */
export async function main() {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // ⚠️ en local uniquement
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

  const data = (await res.json()) as SourceCountry[];

  // Upsert par batch pour éviter les limites
  const BATCH_SIZE = 500;

  let insertedOrUpdated = 0;
  let skipped = 0;

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const chunk = data.slice(i, i + BATCH_SIZE);

    const rows = buildRows(chunk);
    skipped += chunk.length - rows.length;

    const { error } = await supabase
      .from("countries")
      .upsert(rows, { onConflict: "iso2" });

    if (error) throw error;
    insertedOrUpdated += rows.length;
  }

  console.log(
    `✅ countries seeded. upserted=${insertedOrUpdated} skipped=${skipped}`
  );
}

// Only auto-run when executed directly (avoid running during tests/imports)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error("❌ seedCountries failed:", e);
    process.exit(1);
  });
}
