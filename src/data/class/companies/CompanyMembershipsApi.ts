import { ResourceApi } from "../ResourceApi";
import type { CompanyMembership } from "@/schemas/companies.schema";

/**
 * API dédiée à la table `company_memberships`
 *
 * Responsabilité :
 * - gérer les liens user <-> company
 * - rien de plus
 * - rien de moins
 */
export class CompanyMembershipsApi extends ResourceApi<CompanyMembership> {
  constructor() {
    super({
      table: "company_memberships",
      select: "id, company_id, user_id, role, created_at",
      sortableColumns: ["role", "created_at"],
      searchColumns: [],
      protectedColumns: ["company_id", "user_id"],
    });
  }

  /* ------------------------------------------------------------------ */
  /*                        Méthodes métier                             */
  /* ------------------------------------------------------------------ */

  /**
   * Liste les membres d’une entreprise
   * @param companyId ID de l’entreprise
   * @param options Options additionnelles
   * @return Liste des membres
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
   * Liste les entreprises d’un utilisateur
   * @param userId ID de l’utilisateur
   * @param options Options additionnelles
   * @return Liste des memberships
   */
  async listByUser(
    userId: string,
    options?: {
      signal?: AbortSignal;
    }
  ) {
    return this.list({
      page: 1,
      pageSize: 100,
      filters: {
        user_id: { op: "eq", value: userId },
      },
      sort: { column: "created_at", dir: "desc" },
      signal: options?.signal,
    });
  }

  /**
   * Change le rôle d’un membre
   * @param id ID du membership
   * @param role Nouveau rôle
   * @return Membership mis à jour
   */
  async setRole(id: string, role: CompanyMembership["role"]) {
    return this.update(id, { role });
  }

  /**
   * Retire un utilisateur d’une entreprise
   * @param id ID du membership
   * @return Résultat de l’opération
   */
  async removeMember(id: string) {
    return this.remove(id);
  }
}
