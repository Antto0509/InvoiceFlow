import { createClient } from "@/data/supabase/client";
import {
  applyFilters,
  stripGenerated,
  stripGeneratedMany,
  stripProtected,
} from "@/lib/index";
import type {
  FilterOps,
  ListQuery,
  Paginated,
  ResourceApiOptions,
  SortSpec,
} from "@/lib/index";

/**
 * API générique CRUD pour une ressource Supabase/PostgREST
 */
export class ResourceApi<T extends Record<string, unknown>> {
  /** Instance Supabase */
  protected supabase = createClient();

  /** Configuration de la ressource */
  protected table: string;
  protected select: string;
  protected sortableColumns: string[];
  protected searchColumns: string[];
  protected countMode: "exact" | "planned" | "estimated";
  protected mapRow?: (row: unknown) => T;
  protected defaultFilters?: Record<string, FilterOps>;
  protected primaryKey: string[];
  protected conflictTarget?: string | string[];
  protected protectedColumns?: string[];

  constructor(opts: ResourceApiOptions<T>) {
    this.log("[ResourceApi:init]", opts.table);

    this.table = opts.table;
    this.select = opts.select ?? "*";
    this.sortableColumns = opts.sortableColumns ?? [];
    this.searchColumns = opts.searchColumns ?? [];
    this.countMode = opts.countMode ?? "exact";
    this.mapRow = opts.mapRow;
    this.defaultFilters = opts.defaultFilters;
    this.primaryKey = Array.isArray(opts.primaryKey)
      ? opts.primaryKey
      : [opts.primaryKey ?? "id"];
    this.conflictTarget = opts.conflictTarget;
    this.protectedColumns = opts.protectedColumns;
  }

  /* -------------------------------------------------------------------------- */
  /* Helpers internes                                                            */
  /* -------------------------------------------------------------------------- */

  /**
   * Donne les clés primaire sous forme de tableau (même pour clé simple)
   * @example ["id"] ou ["col1","col2"]
   * @param void
   * @returns string[]
   */
  protected get pkColumns(): string[] {
    return this.primaryKey;
  }

  /**
   * Donne les clés primaire sous forme de chaîne (même pour clé simple)
   * @example "id" ou "col1,col2"
   * @param void
   * @returns string
   */
  protected get pkSelect(): string {
    return this.primaryKey.join(",");
  }

  /** 
   * Log uniquement en développement 
   * @param args Arguments à logger
   * @returns void
   */
  protected log(...args: unknown[]) {
    if (process.env.NODE_ENV === "development") {
      console.log(...args);
    }
  }

  /** 
   * Applique la clé primaire (simple ou composite) 
   * @param req Requête à modifier
   * @param key Valeur de la clé primaire
   * @returns Requête modifiée
   */
  protected applyPkFilter<Query extends { eq(column: string, value: unknown): Query }>(
    req: Query,
    key: unknown
  ): Query {
    if (this.primaryKey.length > 1) {
      if (!Array.isArray(key) || key.length !== this.primaryKey.length) {
        throw new Error(
          `[ResourceApi] Composite PK for table=${this.table} expects ${this.primaryKey.length} values`
        );
      }

      return this.primaryKey.reduce(
        (q, col, i) => q.eq(col, key[i]),
        req
      );
    }

    return req.eq(this.primaryKey[0], key);
  }

  /** 
   * Ajoute un AbortSignal si le builder Supabase le supporte 
   * @param req Requête à modifier
   * @param signal Signal d'abandon
   * @returns Requête modifiée
   */
  protected applyAbortSignal<TReq>(req: TReq, signal?: AbortSignal): TReq {
    if (!signal) return req;

    const maybe = req as unknown as {
      abortSignal?: (signal: AbortSignal) => TReq;
    };

    if (typeof maybe.abortSignal === "function") {
      return maybe.abortSignal(signal);
    }

    return req;
  }

  /** 
   * Construit un OR ILIKE sécurisé 
   * @param raw Terme de recherche brut
   * @returns Expression OR ou undefined
   */
  protected buildSearchOr(raw?: string): string | undefined {
    if (!raw || !raw.trim() || this.searchColumns.length === 0) return;

    const term = raw
      .trim()
      .replaceAll(",", " ")
      .replace(/[%_]/g, (m) => `\\${m}`);

    if (!term) return;
    const pattern = `%${term}%`;

    return this.searchColumns.map((c) => `${c}.ilike.${pattern}`).join(",");
  }

  /** 
   * Valide un tri contre la whitelist 
   * @param sort Spécification de tri
   * @returns Spécification validée ou undefined
   */
  protected ensureSortable(sort?: SortSpec): SortSpec | undefined {
    if (!sort) return;
    if (!this.sortableColumns.includes(sort.column)) return;

    return {
      column: sort.column,
      dir: sort.dir ?? "asc",
      foreignTable: sort.foreignTable,
      nulls: sort.nulls,
    };
  }

  /** 
   * Applique filtres par défaut + filtres utilisateur 
   * @param req Requête à modifier
   * @param filters Filtres utilisateur
   * @returns Requête modifiée
   */
  protected applyAllFilters<TReq>(
    req: TReq,
    filters?: Record<string, FilterOps | undefined>
  ): TReq {
    let r = req;
    if (this.defaultFilters) r = applyFilters(r, this.defaultFilters);
    if (filters) r = applyFilters(r, filters);
    return r;
  }

  /* -------------------------------------------------------------------------- */
  /* Méthodes publiques                                                         */
  /* -------------------------------------------------------------------------- */

  /**
   * Liste les ressources avec pagination, filtres, recherche et tri
   * @param q Paramètres de la requête
   * @returns Résultat paginé
   */
  async list(q: ListQuery = {}): Promise<Paginated<T>> {
    const page = q.page && q.page > 0 ? q.page : 1;
    const pageSize = q.pageSize && q.pageSize > 0 ? q.pageSize : 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let req = this.supabase
      .from(this.table)
      .select(this.select, { count: this.countMode })
      .range(from, to);

    req = this.applyAbortSignal(req, q.signal);

    req = this.applyAllFilters(req, q.filters);

    const orExpr = this.buildSearchOr(q.search);
    if (orExpr) req = req.or(orExpr);

    const sort = this.ensureSortable(q.sort);
    if (sort) {
      req = req.order(sort.column, {
        ascending: sort.dir === "asc",
        foreignTable: sort.foreignTable,
        nullsFirst:
          sort.nulls === "first"
            ? true
            : sort.nulls === "last"
            ? false
            : undefined,
      });
    }

    const { data, count, error } = await req;
    if (error) throw error;

    return {
      data: (data ?? []).map((r: unknown) =>
        this.mapRow ? this.mapRow(r) : r
      ) as T[],
      page,
      pageSize,
      total: count ?? 0,
    };
  }

  /**
   * Récupère une ressource par sa clé primaire
   * @param key Clé primaire
   * @param customSelect Sélection personnalisée
   * @returns Ressource
   */
  async get(key: unknown, customSelect?: string): Promise<T> {
    let req = this.supabase.from(this.table).select(customSelect ?? this.select);
    req = this.applyPkFilter(req, key);
    req = this.applyAllFilters(req);

    const { data, error } = await req.single();
    if (error) throw error;

    return (this.mapRow ? this.mapRow(data) : data) as T;
  }

  /**
   * Crée une nouvelle ressource
   * @param payload Données de la ressource
   * @returns Ressource créée
   */
  async create(payload: Partial<T>): Promise<T> {
    const clean = stripProtected(
      stripGenerated(payload as Record<string, unknown>),
      this.protectedColumns
    );

    const { data, error } = await this.supabase
      .from(this.table)
      .insert(clean)
      .select()
      .single();

    if (error) throw error;
    return (this.mapRow ? this.mapRow(data) : data) as T;
  }

  /**
   * Met à jour une ressource existante
   * @param key Clé primaire
   * @param payload Données à mettre à jour
   * @returns Ressource mise à jour
   */
  async update(key: unknown, payload: Partial<T>): Promise<T> {
    const clean = stripProtected(
      stripGenerated(payload as Record<string, unknown>),
      this.protectedColumns
    );

    let req = this.supabase.from(this.table).update(clean);
    req = this.applyPkFilter(req, key);
    req = this.applyAllFilters(req);

    const { data, error } = await req.select().single();
    if (error) throw error;

    return (this.mapRow ? this.mapRow(data) : data) as T;
  }

  /**
   * Insère ou met à jour plusieurs ressources
   * @param payloads Données des ressources
   * @returns Ressources insérées/mises à jour
   */
  async upsertMany(payloads: Partial<T>[]): Promise<T[]> {
    const clean = stripGeneratedMany(payloads as Record<string, unknown>[]);

    const onConflict =
      Array.isArray(this.conflictTarget)
        ? this.conflictTarget.join(",")
        : this.conflictTarget ?? this.pkSelect;

    const { data, error } = await this.supabase
      .from(this.table)
      .upsert(clean, { onConflict })
      .select();

    if (error) throw error;

    return (data ?? []).map((r: unknown) =>
      this.mapRow ? this.mapRow(r) : r
    ) as T[];
  }

  /**
   * Supprime une ressource par sa clé primaire
   * @param key Clé primaire
   * @returns void
   */
  async remove(key: unknown): Promise<void> {
    let req = this.supabase.from(this.table).delete();
    req = this.applyPkFilter(req, key);
    req = this.applyAllFilters(req);

    const { error } = await req;
    if (error) throw error;
  }

  /**
   * Supprime plusieurs ressources par leurs clés primaires
   * @param keys Clés primaires
   * @returns Nombre de ressources supprimées
   */
  async bulkDelete(keys: unknown[]): Promise<number> {
    if (!keys.length) return 0;
    if (this.primaryKey.length > 1) {
      throw new Error("bulkDelete non supporté avec PK composite");
    }

    let req = this.supabase
      .from(this.table)
      .delete({ count: "exact" })
      .in(this.pkColumns[0], keys);

    req = this.applyAllFilters(req);

    const { count, error } = await req;
    if (error) throw error;
    return count ?? 0;
  }

  /**
   * Vérifie l'existence de ressources selon des filtres
   * @param filters Filtres de recherche
   * @returns true si au moins une ressource existe, sinon false
   */
  async exists(filters: Record<string, FilterOps | undefined>): Promise<boolean> {
    let req = this.supabase
      .from(this.table)
      .select(this.pkSelect, { head: true, count: "exact" })
      .limit(1);

    req = this.applyAllFilters(req, filters);

    const { count, error } = await req;
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  /**
   * Compte le nombre de ressources selon des filtres et une recherche
   * @param q Paramètres de requête
   * @returns Nombre de ressources
   */
  async count(q?: {
    filters?: Record<string, FilterOps | undefined>;
    search?: string;
  }): Promise<number> {
    let req = this.supabase
      .from(this.table)
      .select("*", { count: "exact", head: true });

    req = this.applyAllFilters(req, q?.filters);

    const orExpr = this.buildSearchOr(q?.search);
    if (orExpr) req = req.or(orExpr);

    const { count, error } = await req;
    if (error) throw error;
    return count ?? 0;
  }

  /**
   * Liste toutes les ressources avec un limite et des filtres optionnels
   * @param limit Nombre maximum de ressources à retourner
   * @param q Paramètres de requête (filtres, recherche, tri)
   * @returns Liste des ressources
   */
  async listAll(
    limit = 1000,
    q?: Omit<ListQuery, "page" | "pageSize">
  ): Promise<T[]> {
    let req = this.supabase.from(this.table).select(this.select).limit(limit);
    req = this.applyAllFilters(req, q?.filters);

    const orExpr = this.buildSearchOr(q?.search);
    if (orExpr) req = req.or(orExpr);

    const sort = this.ensureSortable(q?.sort);
    if (sort) {
      req = req.order(sort.column, {
        ascending: sort.dir === "asc",
        foreignTable: sort.foreignTable,
        nullsFirst:
          sort.nulls === "first"
            ? true
            : sort.nulls === "last"
            ? false
            : undefined,
      });
    }

    const { data, error } = await req;
    if (error) throw error;

    return (data ?? []).map((r: unknown) =>
      this.mapRow ? this.mapRow(r) : r
    ) as T[];
  }
}
