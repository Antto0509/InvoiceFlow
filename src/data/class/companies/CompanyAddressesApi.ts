import { ResourceApi } from "../ResourceApi";
import type { CompanyAddress } from "@/schemas/companies.schema";

/**
 * API dédiée à la table `company_addresses`
 */
export class CompanyAddressesApi extends ResourceApi<CompanyAddress> {
  constructor() {
    super({
      table: "company_addresses",
      select: "id, company_id, kind, line1, line2, postal_code, city, region, country, created_at, updated_at",
      sortableColumns: ["created_at", "city", "country"],
      searchColumns: ["label", "street", "city", "postal_code", "country"],
      protectedColumns: ["company_id"],
    });
  }

  /* ------------------------------------------------------------------ */
  /*                        Méthodes métier                             */
  /* ------------------------------------------------------------------ */

  /**
   * Liste toutes les adresses d’une entreprise
   * @param companyId ID de l’entreprise
   * @param options Options additionnelles
   * @return Liste des adresses
   */
  async listByCompany(
    companyId: string,
    options?: {
      signal?: AbortSignal;
    }
  ) {
    return this.list({
      page: 1,
      pageSize: 100,
      filters: {
        company_id: { op: "eq", value: companyId },
      },
      sort: { column: "created_at", dir: "asc" },
      signal: options?.signal,
    });
  }

  /**
   * Suppression sécurisée d’une adresse
   * @param id ID de l’adresse
   * @return Résultat de l’opération
   */
  async removeAddress(id: string) {
    return this.remove(id);
  }
}
