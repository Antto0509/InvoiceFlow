import { createClient } from "@/data/supabase/client";
import {logAction, viewCompanyID} from "@/data/logs";
import {LogsStatus, LogsActionNature} from "@/features/logs/schemas/logs.schema";
import {
  buildOrIlike,
  ensureSortable,
  stripGenerated,
  stripGeneratedMany,
  applyFilters,
  stripProtected,
} from "@/lib/utils";
import type { Paginated, FilterOps, ResourceApiOptions, ListQuery } from "@/lib/types";

// --- API générique pour une ressource CRUD avec Supabase/PostgREST ---

/**
 * Crée une API CRUD pour une ressource donnée avec Supabase/PostgREST.
 * @param opts Options de configuration de l'API.
 * @returns Un objet contenant les méthodes CRUD pour la ressource.
 * 
 * @deprecated Use ResourceApi class instead  
 */
export function createResourceApi<T extends Record<string, unknown>>(opts: ResourceApiOptions<T>) {
  console.log("[ResourceApi] Initializing", { 
    opts: {
      table: opts.table,
      select: opts.select,
      sortableColumns: opts.sortableColumns,
      searchColumns: opts.searchColumns,
      countMode: opts.countMode,
      primaryKey: opts.primaryKey,
      conflictTarget: opts.conflictTarget,
      protectedColumns: opts.protectedColumns,
    }
  });

  const supabase = createClient();
  const {
    table,
    select = "*",
    sortableColumns = [],
    searchColumns = [],
    countMode = "exact",
    mapRow,
    defaultFilters,
    primaryKey = "id" as keyof T & string | (keyof T & string)[],
    conflictTarget,
    protectedColumns,
  } = opts;

  /** Helper : est-ce une PK composite ? */
  const isCompositePk = Array.isArray(primaryKey);
  const pkColumns = (Array.isArray(primaryKey) ? primaryKey : [primaryKey]) as string[];

  /**
   * Helper : applique les conditions de PK à une requête Supabase
   * @param req Requête Supabase en cours de construction
   * @param key Valeur(s) de la clé primaire
   * @returns Requête Supabase avec les conditions de PK appliquées
   */
  function applyPkFilter<Query extends { eq(column: string, value: unknown): Query }>(
    req: Query,
    key: unknown
  ): Query {
    console.log("[ResourceApi:applyPkFilter] key", { table, key });

    // PK composite
    if (isCompositePk) {
      const keyArray = Array.isArray(key) ? key : [];
      if (keyArray.length !== pkColumns.length) {
        throw new Error(
          `[ResourceApi] Composite PK for table=${table} attend un array de ${pkColumns.length} valeurs`
        );
      }

      let q = req;
      pkColumns.forEach((col, idx) => {
        q = q.eq(col, keyArray[idx] as unknown);
      });
      return q;
    }

    // PK simple
    return req.eq(pkColumns[0], key as unknown);
  }

  /** Colonnes à sélectionner quand on veut juste la PK (exists) */
  const pkSelect = pkColumns.join(",");

  return {
    /** 
     * Liste paginée avec filtres, recherche, tri sécurisé
     * @param q Paramètres de la requête
     * @returns Résultats paginés
     */
    async list(q: ListQuery = {}): Promise<Paginated<T>> {
      try {
        console.log("[ResourceApi:list] query", { table, q });

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
        return { data: rows as T[], page, pageSize, total: count ?? 0 };
      } catch (err) {
        console.error(`[ResourceApi:list] table=${table}`, err);
        throw err;
      }
    },

    /** 
     * Récupère un item unique par clé primaire (simple ou composite) 
     * @param key Valeur(s) de la clé primaire
     * @param customSelect Optionnel: SELECT personnalisé
     * @returns L'item correspondant
     */
    async get(key: unknown, customSelect?: string): Promise<T> {
      try {
        console.log("[ResourceApi:get] key", { table, key });

        let req = supabase.from(table).select(customSelect ?? select);
        req = applyPkFilter(req, key);
        if (defaultFilters) req = applyFilters(req, defaultFilters);
        const { data, error } = await req.single();
        if (error) throw error;
        return (mapRow ? mapRow(data) : data) as T;
      } catch (err) {
        console.error(`[ResourceApi:get] table=${table} key=${JSON.stringify(key)}`, err);
        throw err;
      }
    },

    /** Crée un nouvel item 
     * @param payload Données de l'item à créer
     * @returns L'item créé
     */
    async create(payload: Partial<T>): Promise<T> {
      try {
        console.log("[ResourceApi:create] payload", { table, payload });

        const clean = stripProtected(stripGenerated(payload as Record<string, unknown>), protectedColumns);
        const { data, error } = await supabase.from(table).insert(clean).select().single();
        if (error) {
          await logAction({
            companyID: viewCompanyID({table, objectID:data.id}), action:"insert" as LogsActionNature, payload, logError:error, status: "error" as LogsStatus
            }); //faudra trouver un truc pour companyID
          throw error;
        }
        await logAction({
          companyID: viewCompanyID({table, objectID:data.id}), action:"insert" as LogsActionNature, payload, status: "success" as LogsStatus
          }); //faudra trouver un truc pour companyID
        return (mapRow ? mapRow(data) : data) as T;
      } catch (err) {
        console.error(`[ResourceApi:create] table=${table} payload=`, payload, err);
        throw err;
      }
    },

    /** 
     * Met à jour un item existant par clé primaire (simple ou composite) 
     * @param key Valeur(s) de la clé primaire
     * @param payload Données à mettre à jour
     * @returns L'item mis à jour
     */
    async update(key: unknown, payload: Partial<T>): Promise<T> {
      try {
        console.log("[ResourceApi:update] key", { table, key });

        const clean = stripProtected(stripGenerated(payload as Record<string, unknown>));
        let req = supabase.from(table).update(clean);
        req = applyPkFilter(req, key);
        if (defaultFilters) req = applyFilters(req, defaultFilters);
        const { data, error } = await req.select().single();
        if (error) throw error;
        return (mapRow ? mapRow(data) : data) as T;
      } catch (err) {
        console.error(
          `[ResourceApi:update] table=${table} key=${JSON.stringify(key)} payload=`,
          payload,
          err
        );
        throw err;
      }
    },

    /** 
     * Upsert (insert ou update) plusieurs items en une seule opération
     * @param payloads Liste des items à upserter
     * @returns Liste des items upsertés
     */
    async upsertMany(payloads: Partial<T>[]): Promise<T[]> {
      try {
        console.log("[ResourceApi:upsertMany] payloads", { table, payloads });

        const clean = stripGeneratedMany(payloads as Record<string, unknown>[]);
        const onConflict = Array.isArray(conflictTarget)
          ? conflictTarget.join(",")
          : conflictTarget ?? pkSelect;

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

    /** 
     * Supprime un item par clé primaire (simple ou composite) 
     * @param key Valeur(s) de la clé primaire
     */
    async remove(key: unknown): Promise<void> {
      try {
        console.log("[ResourceApi:remove] key", { table, key });

        let req = supabase.from(table).delete();
        req = applyPkFilter(req, key);
        if (defaultFilters) req = applyFilters(req, defaultFilters);
        const { error } = await req;
        if (error) throw error;
      } catch (err) {
        console.error(`[ResourceApi:remove] table=${table} key=${JSON.stringify(key)}`, err);
        throw err;
      }
    },

    /** 
     * Bulk delete par PK → uniquement si PK simple
     * @param keys Liste des valeurs de la clé primaire
     * @returns Nombre d'items supprimés
     */
    async bulkDelete(keys: unknown[]): Promise<number> {
      try {
        console.log("[ResourceApi:bulkDelete] keys", { table, keys });

        if (!keys?.length) return 0;
        if (isCompositePk) {
          throw new Error(
            `[ResourceApi:bulkDelete] table=${table} ne supporte pas bulkDelete avec PK composite`
          );
        }
        let req = supabase
          .from(table)
          .delete({ count: "exact" })
          .in(pkColumns[0], keys as unknown[]);
        if (defaultFilters) req = applyFilters(req, defaultFilters);
        const { count, error } = await req;
        if (error) throw error;
        return count ?? 0;
      } catch (err) {
        console.error(`[ResourceApi:bulkDelete] table=${table}`, keys, err);
        throw err;
      }
    },

    /** 
     * Compte les items avec filtres et recherche optionnels
     * @param q Paramètres de la requête
     * @returns Nombre total d'items correspondant
     */
    async count(q?: { filters?: Record<string, FilterOps | undefined>; search?: string }) {
      try {
        console.log("[ResourceApi:count] query", { table, q });

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

    /** 
     * Vérifie l'existence d'items correspondant à des filtres arbitraires 
     * (sélectionne la clé primaire pour une requête head)
     * @param filters Filtres à appliquer
     * @returns true si au moins un item correspond, false sinon 
     */
    async exists(filters: Record<string, FilterOps | undefined>) {
      try {
        console.log("[ResourceApi:exists] filters", { table, filters });

        let req = supabase
          .from(table)
          .select(pkSelect, { head: true, count: "exact" })
          .limit(1);
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

    /** Liste non paginée (cap) avec mêmes fonctionnalités de requête que list() 
     * @param limit Nombre maximum d'items à récupérer
     * @param q Paramètres de la requête (sans page ni pageSize)
     * @returns Liste des items correspondant
     */
    async listAll(limit = 1000, q?: Omit<ListQuery, "page" | "pageSize">) {
      try {
        console.log("[ResourceApi:listAll] query", { table, q, limit });

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
