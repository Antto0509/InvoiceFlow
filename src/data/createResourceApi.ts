import { createClient } from "@/data/supabase/client";
import { buildOrIlike, ensureSortable, stripGenerated, stripGeneratedMany, applyFilters, stripProtected } from "@/lib/utils";
import type { Paginated, FilterOps, ResourceApiOptions, ListQuery } from "@/lib/types";

// --- API générique pour une ressource CRUD avec Supabase/PostgREST ---

/**
 * Crée une API CRUD pour une ressource donnée avec Supabase/PostgREST.
 * @param opts Options de configuration de l'API.
 * @returns Un objet contenant les méthodes CRUD pour la ressource.
 */
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
    protectedColumns,
  } = opts;

  /** Primary key column name */
  const PK = String(primaryKey);

  return {
    /** List with pagination, filters, search and safe sorting */
    async list(q: ListQuery = {}): Promise<Paginated<T>> {
      try {
        const page = q.page && q.page > 0 ? q.page : 1;
        const pageSize = q.pageSize && q.pageSize > 0 ? q.pageSize : 20;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let req = supabase.from(table).select(select, { count: countMode }).range(from, to);

        if (q.signal && typeof (req as { abortSignal?: (signal: AbortSignal) => unknown }).abortSignal === "function") {
          req = (req as { abortSignal?: (signal: AbortSignal) => unknown }).abortSignal!(q.signal) as unknown as typeof req;
        }

        if (defaultFilters) req = applyFilters(req, defaultFilters);
        if (q.filters) req = applyFilters(req, q.filters);

        if (q.search && q.search.trim() && searchColumns.length > 0) {
          const orExpr = buildOrIlike(searchColumns, q.search);
          if (orExpr) req = req.or(orExpr);
        }

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

        const rows = (data ?? []).map((r: unknown) => (mapRow ? mapRow(r) : r));
        return { data: rows, page, pageSize, total: count ?? 0 };
      } catch (err) {
        console.error(`[ResourceApi:list] table=${table}`, err);
        throw err;
      }
    },

    /** Get single item by primary key */
    async get(key: T[typeof primaryKey], customSelect?: string): Promise<T> {
      try {
        let req = supabase.from(table).select(customSelect ?? select).eq(PK, key as unknown);
        if (defaultFilters) req = applyFilters(req, defaultFilters);
        const { data, error } = await req.single();
        if (error) throw error;
        return (mapRow ? mapRow(data) : data) as T;
      } catch (err) {
        console.error(`[ResourceApi:get] table=${table} key=${key}`, err);
        throw err;
      }
    },

    /** Create a new item */
    async create(payload: Partial<T>): Promise<T> {
      try {
        const clean = stripProtected(stripGenerated(payload as Record<string, unknown>), protectedColumns);
        const { data, error } = await supabase.from(table).insert(clean).select().single();
        if (error) throw error;
        return (mapRow ? mapRow(data) : data) as T;
      } catch (err) {
        console.error(`[ResourceApi:create] table=${table} payload=`, payload, err);
        throw err;
      }
    },

    /** Update an existing item by primary key */
    async update(key: T[typeof primaryKey], payload: Partial<T>): Promise<T> {
      try {
        const clean = stripProtected(stripGenerated(payload as Record<string, unknown>));
        const { data, error } = await supabase
          .from(table)
          .update(clean)
          .eq(PK, key as unknown)
          .select()
          .single();
        if (error) throw error;
        return (mapRow ? mapRow(data) : data) as T;
      } catch (err) {
        console.error(`[ResourceApi:update] table=${table} key=${key} payload=`, payload, err);
        throw err;
      }
    },

    /** Upsert (insert or update) an item */
    async upsertMany(payloads: Partial<T>[]): Promise<T[]> {
      try {
        const clean = stripGeneratedMany(payloads as Record<string, unknown>[]);
        const onConflict = Array.isArray(conflictTarget)
          ? conflictTarget.join(",")
          : conflictTarget ?? PK;

        const { data, error } = await supabase
          .from(table)
          .upsert(clean, { onConflict })
          .select();

        if (error) throw error;
        return (data ?? []).map((r: Record<string, unknown>) => (mapRow ? mapRow(r) : r)) as T[];
      } catch (err) {
        console.error(`[ResourceApi:upsertMany] table=${table}`, payloads, err);
        throw err;
      }
    },

    /** Delete an item by primary key */
    async remove(key: T[typeof primaryKey]): Promise<void> {
      try {
        let req = supabase.from(table).delete().eq(PK, key as unknown);
        if (defaultFilters) req = applyFilters(req, defaultFilters);
        const { error } = await req;
        if (error) throw error;
      } catch (err) {
        console.error(`[ResourceApi:remove] table=${table} key=${key}`, err);
        throw err;
      }
    },

    /** Bulk delete by primary keys */
    async bulkDelete(keys: Array<T[typeof primaryKey]>): Promise<number> {
      try {
        if (!keys?.length) return 0;
        let req = supabase.from(table).delete({ count: "exact" }).in(PK, keys as unknown[]);
        if (defaultFilters) req = applyFilters(req, defaultFilters);
        const { count, error } = await req;
        if (error) throw error;
        return count ?? 0;
      } catch (err) {
        console.error(`[ResourceApi:bulkDelete] table=${table}`, keys, err);
        throw err;
      }
    },

    /** Fast count with optional filters/search */
    async count(q?: { filters?: Record<string, FilterOps | undefined>; search?: string }) {
      try {
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
      } catch (err) {
        console.error(`[ResourceApi:count] table=${table}`, q, err);
        throw err;
      }
    },

    /** Existence check using arbitrary filters (selects PK for head request) */
    async exists(filters: Record<string, FilterOps | undefined>) {
      try {
        let req = supabase.from(table).select(PK, { head: true, count: "exact" }).limit(1);
        if (defaultFilters) req = applyFilters(req, defaultFilters);
        req = applyFilters(req, filters);
        const { count, error } = await req;
        if (error) throw error;
        return (count ?? 0) > 0;
      } catch (err) {
        console.error(`[ResourceApi:exists] table=${table}`, filters, err);
        throw err;
      }
    },

    /** Unpaginated list (cap) with same query features as list() */
    async listAll(limit = 1000, q?: Omit<ListQuery, "page" | "pageSize">) {
      try {
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

        return (data ?? []).map((r: unknown) => (mapRow ? mapRow(r) : r)) as T[];
      } catch (err) {
        console.error(`[ResourceApi:listAll] table=${table}`, q, err);
        throw err;
      }
    },
  };
}