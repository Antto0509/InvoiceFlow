import { createClient } from "@/data/supabase/client";
import { escapeLike, buildOrIlike, ensureSortable, stripGenerated, stripGeneratedMany } from "@/lib/utils";
import type { Paginated, FilterOps, ResourceApiOptions, ListQuery } from "@/lib/types";

// --- API générique pour une ressource CRUD avec Supabase/PostgREST ---

export function createResourceApi<T extends Record<string, unknown>>(opts: ResourceApiOptions<T>) {
  const supabase = createClient();
  const {
    table,
    select = "*",
    sortableColumns = [],
    searchColumns = [],
    countMode = "exact",
    mapRow,
    defaultFilters,
    primaryKey = "id" as keyof T & string,
    conflictTarget,
  } = opts;

  /** Primary key column name */
  const PK = String(primaryKey);

  /** PostgREST-like filters */
  interface Filterable<TSelf> {
    eq(col: string, val: unknown): TSelf;
    neq(col: string, val: unknown): TSelf;
    gt(col: string, val: unknown): TSelf;
    gte(col: string, val: unknown): TSelf;
    lt(col: string, val: unknown): TSelf;
    lte(col: string, val: unknown): TSelf;
    ilike(col: string, val: string): TSelf;
    "in"(col: string, vals: unknown[]): TSelf;
    or(expr: string): TSelf;
    order(col: string, opts?: { ascending?: boolean; foreignTable?: string; nullsFirst?: boolean }): TSelf;
    range(from: number, to: number): TSelf;
    select(sel: string, opts?: { count?: "exact" | "planned" | "estimated"; head?: boolean }): TSelf;
    abortSignal?(signal: AbortSignal): TSelf;
    limit(n: number): TSelf;
  }

  function applyFilters<TReq extends Filterable<TReq>>(
    req: TReq,
    filters?: Record<string, FilterOps | undefined>
  ): TReq {
    if (!filters) return req;
    for (const [col, spec] of Object.entries(filters)) {
      if (!spec) continue;
      const { op, value } = spec as FilterOps & { value: unknown };
      if (value === undefined || value === null || value === "") continue;
      switch (op) {
        case "eq":   req = req.eq(col, value); break;
        case "neq":  req = req.neq(col, value); break;
        case "gt":   req = req.gt(col, value); break;
        case "gte":  req = req.gte(col, value); break;
        case "lt":   req = req.lt(col, value); break;
        case "lte":  req = req.lte(col, value); break;
        case "ilike": req = req.ilike(col, `%${escapeLike(String(value))}%`); break;
        case "in":   req = req["in"](col, value as unknown[]); break;
      }
    }
    return req;
  }

  return {
    /** List with pagination, filters, search and safe sorting */
    async list(q: ListQuery = {}): Promise<Paginated<T>> {
      const page = q.page && q.page > 0 ? q.page : 1;
      const pageSize = q.pageSize && q.pageSize > 0 ? q.pageSize : 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let req = supabase.from(table).select(select, { count: countMode }).range(from, to);

      // AbortSignal (supported in @supabase/postgrest-js ≥1.7)
      if (q.signal && typeof (req as unknown as { abortSignal?: (signal: AbortSignal) => unknown }).abortSignal === "function") {
        // cast abortSignal to a function returning the same request type and call it
        req = ((req as unknown as { abortSignal: (signal: AbortSignal) => typeof req }).abortSignal)(q.signal);
      }

      if (defaultFilters) req = applyFilters(req, defaultFilters);
      if (q.filters)       req = applyFilters(req, q.filters);

      if (q.search && q.search.trim() && searchColumns.length > 0) {
        const orExpr = buildOrIlike(searchColumns, q.search);
        if (orExpr) req = req.or(orExpr);
      }

      const safeSort = ensureSortable(q.sort, sortableColumns);
      if (safeSort) {
        req = req.order(safeSort.column, {
          ascending: safeSort.dir === "asc",
          foreignTable: safeSort.foreignTable,
          nullsFirst: safeSort.nulls === "first" ? true : safeSort.nulls === "last" ? false : undefined,
        });
      }

      const { data, count, error } = await req;
      if (error) throw error;
      const rows = ((data ?? []) as unknown[]).map((r) => (mapRow ? mapRow(r) : (r as T)));
      return { data: rows as T[], page, pageSize, total: count ?? 0 };
    },

    async get(key: T[typeof primaryKey], customSelect?: string): Promise<T> {
      const { data, error } = await supabase
        .from(table)
        .select(customSelect ?? select)
        .eq(PK, key as unknown)
        .single();
      if (error) throw error;
      return (mapRow ? mapRow(data) : data) as T;
    },

    async create(payload: Partial<T>): Promise<T> {
      const clean = stripGenerated(payload as Record<string, unknown>);
      const { data, error } = await supabase.from(table).insert(clean).select().single();
      if (error) throw error;
      return (mapRow ? mapRow(data) : data) as T;
    },

    async update(key: T[typeof primaryKey], payload: Partial<T>): Promise<T> {
      const clean = stripGenerated(payload as Record<string, unknown>);
      const { data, error } = await supabase
        .from(table)
        .update(clean)
        .eq(PK, key as unknown)
        .select()
        .single();
      if (error) throw error;
      return (mapRow ? mapRow(data) : data) as T;
    },

    async upsertMany(payloads: Partial<T>[]): Promise<T[]> {
      const clean = stripGeneratedMany(payloads as Record<string, unknown>[]);
      const onConflict =
        Array.isArray(conflictTarget)
          ? conflictTarget.join(",")
          : conflictTarget ?? PK;

      // NOTE: onConflict is important if your PK isn't a generated UUID
      const { data, error } = await supabase.from(table).upsert(clean, { onConflict }).select();
      if (error) throw error;
      return (data ?? []).map((r: unknown) => (mapRow ? mapRow(r) : (r as T))) as T[];
    },

    async remove(key: T[typeof primaryKey]): Promise<void> {
      const { error } = await supabase.from(table).delete().eq(PK, key as unknown);
      if (error) throw error;
    },

    /** Bulk delete by PK values */
    async bulkDelete(keys: Array<T[typeof primaryKey]>): Promise<number> {
      if (!keys?.length) return 0;
      const { count, error } = await supabase
        .from(table)
        .delete({ count: "exact" })
        .in(PK, keys as unknown[]);
      if (error) throw error;
      return count ?? 0;
    },

    /** Fast count with optional filters/search */
    async count(q?: { filters?: Record<string, FilterOps | undefined>; search?: string }) {
      let req = supabase.from(table).select("*", { count: "exact", head: true });
      if (defaultFilters) req = applyFilters(req, defaultFilters);
      if (q?.filters)     req = applyFilters(req, q.filters);
      if (q?.search && q.search.trim() && searchColumns.length > 0) {
        const orExpr = buildOrIlike(searchColumns, q.search);
        if (orExpr) req = req.or(orExpr);
      }
      const { count, error } = await req;
      if (error) throw error;
      return count ?? 0;
    },

    /** Existence check using arbitrary filters (selects PK for head request) */
    async exists(filters: Record<string, FilterOps | undefined>) {
      let req = supabase.from(table).select(PK, { head: true, count: "exact" }).limit(1);
      if (defaultFilters) req = applyFilters(req, defaultFilters);
      req = applyFilters(req, filters);
      const { count, error } = await req;
      if (error) throw error;
      return (count ?? 0) > 0;
    },

    /** Unpaginated list (cap) with same query features as list() */
    async listAll(limit = 1000, q?: Omit<ListQuery, "page" | "pageSize">) {
      let req = supabase.from(table).select(select).limit(limit);
      if (defaultFilters) req = applyFilters(req, defaultFilters);
      if (q?.filters)     req = applyFilters(req, q.filters);
      if (q?.search && q.search.trim() && searchColumns.length > 0) {
        const orExpr = buildOrIlike(searchColumns, q.search);
        if (orExpr) req = req.or(orExpr);
      }
      const safeSort = ensureSortable(q?.sort, sortableColumns);
      if (safeSort) {
        req = req.order(safeSort.column, {
          ascending: safeSort.dir === "asc",
          foreignTable: safeSort.foreignTable,
          nullsFirst: safeSort.nulls === "first" ? true : safeSort.nulls === "last" ? false : undefined,
        });
      }
      const { data, error } = await req;
      if (error) throw error;
      return (data ?? []).map((r: unknown) => (mapRow ? mapRow(r) : (r as T))) as T[];
    },
  };
}