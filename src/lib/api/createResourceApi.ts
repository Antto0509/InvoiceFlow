import { createClient } from "@/lib/supabase/client";

// --- API générique pour une ressource CRUD avec Supabase/PostgREST ---

/** Résultats paginés. */
export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

/** Spécification de tri. */
export type SortSpec = {
  column: string;
  dir?: "asc" | "desc";
  /** Tri sur une colonne d'une table liée (PostgREST: foreignTable) */
  foreignTable?: string;
  /** Position des NULLs, utile pour dates/numériques */
  nulls?: "first" | "last";
};

/** Opérations de filtre supportées. */
export type FilterOps =
  | { op: "eq"; value: unknown }
  | { op: "neq"; value: unknown }
  | { op: "gt"; value: unknown }
  | { op: "gte"; value: unknown }
  | { op: "lt"; value: unknown }
  | { op: "lte"; value: unknown }
  | { op: "ilike"; value: string }
  | { op: "in"; value: unknown[] };

/** Paramètres pour une requête de liste. */
export type ListQuery = {
  page?: number; // 1-based
  pageSize?: number;
  sort?: SortSpec;
  filters?: Record<string, FilterOps | undefined>;
  search?: string;
  /** Pour annuler une requête (ex: typeahead, debounce) */
  signal?: AbortSignal;
};

/** Options pour créer une API ressource. */
export type ResourceApiOptions<T> = {
  table: string;
  /** SELECT PostgREST : ex. "*, clients(name)" */
  select?: string;
  /** Colonnes autorisées pour le tri (sécurité) */
  sortableColumns?: string[];
  /** Colonnes utilisées pour la recherche ILIKE (OR) */
  searchColumns?: string[];
  /** Count mode: "exact" (par défaut) ou "estimated"/"planned" pour perfs */
  countMode?: "exact" | "planned" | "estimated";
  /** Transform optionnel pour post-traiter les rows */
  mapRow?: (row: unknown) => T;
  /** Filtres appliqués à TOUTES les listes (ex: multitenant user_id) */
  defaultFilters?: Record<string, FilterOps>;
};

/** Échappe % et _ pour LIKE/ILIKE. */
export function escapeLike(input: string) {
  return input.replace(/[%_]/g, (m) => `\\${m}`);
}

/** Construit un OR ILIKE multi-colonnes. */
export function buildOrIlike(columns: string[], raw: string) {
  const term = escapeLike(raw.trim().replaceAll(",", " "));
  if (!term) return undefined;
  const pattern = `%${term}%`;
  return columns.map((c) => `${c}.ilike.${pattern}`).join(",");
}

/** Valide une spec de tri contre la whitelist. */
function ensureSortable(sort?: SortSpec, whitelist: string[] = []): SortSpec | undefined {
  if (!sort) return undefined;
  if (!whitelist.includes(sort.column)) return undefined;
  return {
    column: sort.column,
    dir: sort.dir ?? "asc",
    foreignTable: sort.foreignTable,
    nulls: sort.nulls,
  };
}

export function createResourceApi<T extends { id: string }>(opts: ResourceApiOptions<T>) {
  const supabase = createClient();
  const {
    table,
    select = "*",
    sortableColumns = [],
    searchColumns = [],
    countMode = "exact",
    mapRow,
    defaultFilters,
  } = opts;

  /** Applique un dictionnaire de filtres PostgREST à une requête Supabase */
  interface Filterable<TSelf> {
    eq(col: string, val: unknown): TSelf;
    neq(col: string, val: unknown): TSelf;
    gt(col: string, val: unknown): TSelf;
    gte(col: string, val: unknown): TSelf;
    lt(col: string, val: unknown): TSelf;
    lte(col: string, val: unknown): TSelf;
    ilike(col: string, val: string): TSelf;
    "in"(col: string, vals: unknown[]): TSelf;
  }

  function applyFilters<TReq extends Filterable<TReq>>(
    req: TReq,
    filters?: Record<string, FilterOps | undefined>
  ): TReq {
    if (!filters) return req;
    for (const [col, spec] of Object.entries(filters)) {
      if (!spec) continue;
      const { op } = spec as FilterOps;
      const value = (spec as FilterOps).value;
      if (value === undefined || value === null || value === "") continue;
      switch (op) {
        case "eq":
          req = req.eq(col, value);
          break;
        case "neq":
          req = req.neq(col, value);
          break;
        case "gt":
          req = req.gt(col, value);
          break;
        case "gte":
          req = req.gte(col, value);
          break;
        case "lt":
          req = req.lt(col, value);
          break;
        case "lte":
          req = req.lte(col, value);
          break;
        case "ilike":
          req = req.ilike(col, `%${escapeLike(String(value))}%`);
          break;
        case "in":
          req = req["in"](col, value as unknown[]);
          break;
      }
    }
    return req;
  }

  return {
    /** Liste générique : pagination, tri whitelisté, filtres, recherche, AbortSignal. */
    async list(q: ListQuery = {}): Promise<Paginated<T>> {
      const page = q.page && q.page > 0 ? q.page : 1;
      const pageSize = q.pageSize && q.pageSize > 0 ? q.pageSize : 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let req = supabase.from(table).select(select, { count: countMode }).range(from, to);

      // AbortSignal (silencieux si méthode absente selon version)
      if (q.signal) {
        const maybeAbortable = req as unknown as { abortSignal?: (signal: AbortSignal) => unknown };
        if (typeof maybeAbortable.abortSignal === "function") {
          req = (maybeAbortable.abortSignal(q.signal) as unknown) as typeof req;
        }
      }

      // Filtres
      if (defaultFilters) req = applyFilters(req, defaultFilters);
      if (q.filters) req = applyFilters(req, q.filters);

      // Recherche (OR ILIKE)
      if (q.search && q.search.trim() && searchColumns.length > 0) {
        const orExpr = buildOrIlike(searchColumns, q.search);
        if (orExpr) req = req.or(orExpr);
      }

      // Tri whitelisté (+ foreignTable + nulls position)
      const safeSort = ensureSortable(q.sort, sortableColumns);
      if (safeSort) {
        req = req.order(safeSort.column, {
          ascending: safeSort.dir === "asc",
          foreignTable: safeSort.foreignTable,
          nullsFirst:
            safeSort.nulls === "first" ? true : safeSort.nulls === "last" ? false : undefined,
        });
      }

      const { data, count, error } = await req;
      if (error) throw error;
      const rows = ((data ?? []) as unknown[]).map((r) =>
        mapRow ? mapRow(r) : (r as T)
      );
      return { data: rows, page, pageSize, total: count ?? 0 };
    },

    async get(id: string, customSelect?: string): Promise<T> {
      const { data, error } = await supabase
        .from(table)
        .select(customSelect ?? select)
        .eq("id", id)
        .single();
      if (error) throw error;
      return (mapRow ? mapRow(data) : data) as T;
    },

    async create(payload: Partial<T>): Promise<T> {
      const { data, error } = await supabase.from(table).insert(payload).select().single();
      if (error) throw error;
      return (mapRow ? mapRow(data) : data) as T;
    },

    async update(id: string, payload: Partial<T>): Promise<T> {
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return (mapRow ? mapRow(data) : data) as T;
    },

    async remove(id: string): Promise<void> {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },

    async upsertMany(payloads: Partial<T>[]): Promise<T[]> {
      const { data, error } = await supabase.from(table).upsert(payloads).select();
      if (error) throw error;
      return (data ?? []).map((r: unknown) => (mapRow ? mapRow(r) : (r as T))) as T[];
    },

    /** Supprime en masse par id */
    async bulkDelete(ids: string[]): Promise<number> {
      if (!ids?.length) return 0;
      const { count, error } = await supabase
        .from(table)
        .delete({ count: "exact" })
        .in("id", ids);
      if (error) throw error;
      return count ?? 0;
    },

    /** Compte rapide */
    async count(q?: { filters?: Record<string, FilterOps | undefined>; search?: string }) {
      let req = supabase.from(table).select("*", { count: "exact", head: true });
      if (defaultFilters) req = applyFilters(req, defaultFilters);
      if (q?.filters) req = applyFilters(req, q.filters);
      if (q?.search && q.search.trim() && searchColumns.length > 0) {
        const orExpr = buildOrIlike(searchColumns, q.search);
        if (orExpr) req = req.or(orExpr);
      }
      const { count, error } = await req;
      if (error) throw error;
      return count ?? 0;
    },

    /** Test existence */
    async exists(filters: Record<string, FilterOps | undefined>) {
      let req = supabase.from(table).select("id", { head: true, count: "exact" }).limit(1);
      if (defaultFilters) req = applyFilters(req, defaultFilters);
      req = applyFilters(req, filters);
      const { count, error } = await req;
      if (error) throw error;
      return (count ?? 0) > 0;
    },

    /** Liste non paginée (cap) */
    async listAll(limit = 1000, q?: Omit<ListQuery, "page" | "pageSize">) {
      let req = supabase.from(table).select(select).limit(limit);
      if (defaultFilters) req = applyFilters(req, defaultFilters);
      if (q?.filters) req = applyFilters(req, q.filters);
      if (q?.search && q.search.trim() && searchColumns.length > 0) {
        const orExpr = buildOrIlike(searchColumns, q.search);
        if (orExpr) req = req.or(orExpr);
      }
      const safeSort = ensureSortable(q?.sort, sortableColumns);
      if (safeSort) {
        req = req.order(safeSort.column, {
          ascending: safeSort.dir === "asc",
          foreignTable: safeSort.foreignTable,
          nullsFirst:
            safeSort.nulls === "first" ? true : safeSort.nulls === "last" ? false : undefined,
        });
      }
      const { data, error } = await req;
      if (error) throw error;
      return (data ?? []).map((r: unknown) => (mapRow ? mapRow(r) : (r as T))) as T[];
    },
  };
}
