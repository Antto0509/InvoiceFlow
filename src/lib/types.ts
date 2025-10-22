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