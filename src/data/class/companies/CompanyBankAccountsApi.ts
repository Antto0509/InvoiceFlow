import { ResourceApi } from "../ResourceApi";
import type { CompanyBankAccount } from "@/schemas/companies.schema";

/**
 * API dédiée à la table `company_bank_accounts`
 */
export class CompanyBankAccountsApi extends ResourceApi<CompanyBankAccount> {
  constructor() {
    super({
      table: "company_bank_accounts",
      select: "*",
      sortableColumns: ["label", "display", "created_at", "updated_at"],
      searchColumns: ["label", "iban", "bic"],
      protectedColumns: ["company_id"],
    });
  }

  /* ------------------------------------------------------------------ */
  /*                        Méthodes métier                             */
  /* ------------------------------------------------------------------ */

  /**
   * Liste tous les comptes bancaires d’une entreprise
   * @param companyId ID de l’entreprise
   * @param options Options additionnelles
   * @return Liste des comptes bancaires
   */
  async listByCompany(
    companyId: string,
    options?: {
      includeHidden?: boolean;
      signal?: AbortSignal;
    }
  ) {
    return this.list({
      page: 1,
      pageSize: 100,
      filters: {
        company_id: { op: "eq", value: companyId },
        ...(options?.includeHidden
            ? {}
            : { display: { op: "eq", value: true } }),
      },
      sort: { column: "created_at", dir: "asc" },
      signal: options?.signal,
    });
  }

  /**
   * Active / désactive l’affichage d’un compte bancaire
   * @param id ID du compte bancaire
   * @param display Nouveau statut d’affichage  
   * @return Compte bancaire mis à jour
   */
  async setDisplay(id: string, display: boolean) {
    return this.update(id, { display });
  }
}
