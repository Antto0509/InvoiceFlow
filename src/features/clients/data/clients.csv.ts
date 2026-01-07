import { Client, clientDbSchema } from "@/schemas/clients.schema";

const MIN_HEADERS = clientDbSchema.pick({
  name: true,
  email: true,
  phone: true,
  notes: true,
}).keyof().enum as unknown as readonly ["name","email","phone","notes"];
const FULL_HEADERS = clientDbSchema.keyof().enum as unknown as readonly string[];
type FullHeader = typeof FULL_HEADERS[number];

/** Parse robuste des CSV (gère les champs entre guillemets, virgules dans valeurs, retours ligne) */
function parseCsvLines(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0, field = "", row: string[] = [], inQuotes = false;

  const pushField = () => { row.push(field); field = ""; };
  const pushRow = () => { rows.push(row); row = []; };

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        // double quote ?
        if (text[i + 1] === '"') {
          field += '"'; i += 2; continue;
        } else {
          inQuotes = false; i++; continue;
        }
      } else {
        field += ch; i++; continue;
      }
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ",") { pushField(); i++; continue; }
      if (ch === "\n") { pushField(); pushRow(); i++; continue; }
      if (ch === "\r") { // handle \r\n
        if (text[i + 1] === "\n") { i += 2; } else { i++; }
        pushField(); pushRow(); continue;
      }
      field += ch; i++; continue;
    }
  }
  // flush last field/row
  pushField();
  if (row.length > 1 || row.some((c) => c.trim() !== "")) pushRow();
  // remove possible trailing empty line
  return rows.filter(r => r.some(cell => cell.trim() !== ""));
}

function normalizeHeader(arr: string[]) {
  return arr.map((h) => h.trim().toLowerCase());
}

function safeParseCsv(text: string): {
  rows: Array<Partial<Client>>;
  headerType: "minimal" | "full" | "invalid";
  error: string | null;
} {
  const grid = parseCsvLines(text);
  if (!grid.length) return { rows: [], headerType: "invalid", error: "CSV vide." };

  const header = normalizeHeader(grid[0]);
  const isMinimal = arrayEquals(header, MIN_HEADERS);
  const isFull = arrayEquals(header, FULL_HEADERS);

  if (!isMinimal && !isFull) {
    return {
      rows: [],
      headerType: "invalid",
      error: `En-têtes invalides. Attendu: "${MIN_HEADERS.join(",")}"` +
             ` ou export complet: "${FULL_HEADERS.join(",")}". Reçu: "${header.join(",")}".`
    };
  }

  const rows = grid.slice(1).map((cols) => {
    // Mappe par nom (ignore les colonnes inconnues)
    const rec: Partial<Client> = {};
    if (isMinimal) {
      MIN_HEADERS.forEach((h, idx) => { rec[h] = (cols[idx] ?? "").trim(); });
    } else {
      // FULL → on ne garde que les champs utiles à l'insert
      const idx: Record<FullHeader, number> = {} as Record<FullHeader, number>;
      FULL_HEADERS.forEach((h, i) => { idx[h] = i; });
      (MIN_HEADERS as readonly string[]).forEach((h) => {
        rec[h as keyof Client] = (cols[idx[h as FullHeader]] ?? "").trim();
      });
    }
    // filtra value vide -> undefined
    for (const k of Object.keys(rec)) {
      const key = k as keyof Client;
      if (rec[key] === "") rec[key] = undefined;
    }
    return rec as Partial<Client>;
  }).filter(r => r.name); // ignore lignes sans nom

  return { rows, headerType: isMinimal ? "minimal" : "full", error: null };
}

function arrayEquals(a: readonly string[], b: readonly string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export { safeParseCsv, MIN_HEADERS, FULL_HEADERS };