import { ResourceApi } from "../ResourceApi";
import { Currency } from "@/schemas/currencies.schema";

/**
 * API dédiée à la table `currencies`
 *
 * - Table de référence
 * - Primary key = code
 * - Peu de logique métier
 */
export class CurrenciesApi extends ResourceApi<Currency> {
  constructor() {
    super({
      table: "currencies",
      select: "*",
      sortableColumns: ["code", "name", "is_active", "created_at", "updated_at"],
      searchColumns: ["code", "name", "symbol"],
      primaryKey: "code",
      conflictTarget: "code",
    });
  }

  /**
   * Recherche légère pour autocomplete / select
   * @param q Terme de recherche
   * @param limit Nombre maximum de résultats
   * @param signal Signal d'annulation
   * @returns Liste des devises trouvées
   */
  async search({
    q,
    limit = 20,
    signal,
  }: {
    q?: string;
    limit?: number;
    signal?: AbortSignal;
  }): Promise<Array<{ code: string; name: string; symbol: string }>> {
    const { data } = await this.list({
      page: 1,
      pageSize: limit,
      search: q,
      sort: { column: "code", dir: "asc" },
      signal,
    });

    return data.map(({ code, name, symbol }) => ({
      code,
      name,
      symbol,
    }));
  }

  /**
   * Liste complète (usage admin / config)
   * @returns Liste de toutes les devises
   */
  async listAll() {
    const { data } = await this.list({
      page: 1,
      pageSize: 100,
      sort: { column: "code", dir: "asc" },
    });

    return data;
  }
}
