import { CompaniesApi } from "./CompaniesApi";
import { CompanyAddressesApi } from "./CompanyAddressesApi";
import { CompanyBankAccountsApi } from "./CompanyBankAccountsApi";
import { CompanyMembershipsApi } from "./CompanyMembershipsApi";

/**
 * Agrégat des API liées aux entreprises
 */
export class CompanyAggregate {
  private companies = new CompaniesApi();
  private addresses = new CompanyAddressesApi();
  private bankAccounts = new CompanyBankAccountsApi();
  private memberships = new CompanyMembershipsApi();

  /* ------------------------------------------------------------------ */
  /*                             Queries                                */
  /* ------------------------------------------------------------------ */

  /**
   * Charge une entreprise avec toutes ses données associées
   * @param companyId ID de l’entreprise
   * @param options Options additionnelles
   * @return Détails complets de l’entreprise
   */
  async getCompanyFull(
    companyId: string,
    options?: {
      signal?: AbortSignal;
    }
  ) {
    const [company, addresses, bankAccounts, memberships] =
      await Promise.all([
        this.companies.get(companyId),
        this.addresses.listByCompany(companyId, options),
        this.bankAccounts.listByCompany(companyId, options),
        this.memberships.listByCompany(companyId, options),
      ]);

    return {
      company,
      addresses: addresses,
      bankAccounts: bankAccounts,
      memberships: memberships,
    };
  }

  /* ------------------------------------------------------------------ */
  /*                             Commands                               */
  /* ------------------------------------------------------------------ */

  /**
   * Crée une entreprise complète (minimale)
   * @param payload Données de création
   * @returns Company créée
   */
  async createCompany(
    payload: Parameters<CompaniesApi["create"]>[0]
  ) {
    return this.companies.create(payload);
  }

  /**
   * Ajoute un membre à une entreprise
   * @param companyId ID de l’entreprise
   * @param userId ID de l’utilisateur
   * @param role Rôle du membre
   * @returns Membership créé
   */
  async addMember(
    companyId: string,
    userId: string,
    role: Parameters<CompanyMembershipsApi["create"]>[0]["role"]
  ) {
    return this.memberships.create({
      company_id: companyId,
      user_id: userId,
      role,
    });
  }

  /**
   * Ajoute une adresse à une entreprise
   * @param companyId ID de l’entreprise
   * @param payload Données de l’adresse (sans company_id)
   * @returns Adresse créée
   */
  async addAddress(
    companyId: string,
    payload: Omit<
      Parameters<CompanyAddressesApi["create"]>[0],
      "company_id"
    >
  ) {
    return this.addresses.create({
      ...payload,
      company_id: companyId,
    });
  }

  /**
   * Ajoute un compte bancaire
   * @param companyId ID de l’entreprise
   * @param payload Données du compte bancaire (sans company_id)
   * @returns Compte bancaire créé
   */
  async addBankAccount(
    companyId: string,
    payload: Omit<
      Parameters<CompanyBankAccountsApi["create"]>[0],
      "company_id"
    >
  ) {
    return this.bankAccounts.create({
      ...payload,
      company_id: companyId,
    });
  }
}

/* ------------------------------------------------------------------ */
/*                       Exemple d'utilisation                        */
/* ------------------------------------------------------------------ */

// Setup

// import { CompanyAggregate } from "@/class/companies/CompanyAggregate";

// const companyAggregate = new CompanyAggregate();

// Création d’une entreprise complète

// const company = await companyAggregate.createCompany({
//   name: "ACME SAS",
//   legal_form: "SAS",
//   country: "FR",
//   vat_number: null,
// });

// Ajout du créateur comme admin

// await companyAggregate.addMember(
//   company.id,
//   currentUser.id,
//   "admin"
// );

// Ajout de l’adresse légale

// await companyAggregate.addAddress(company.id, {
//   label: "Siège social",
//   street: "10 rue de la Paix",
//   postal_code: "75002",
//   city: "Paris",
//   country: "FR",
//   is_legal: true,
// });

// Ajout du compte bancaire

// await companyAggregate.addBankAccount(company.id, {
//   label: "Compte principal",
//   iban: "FR76 3000 6000 0112 3456 7890 189",
//   bic: "AGRIFRPP",
//   display: true,
// });

// Recharge complète (vue dashboard)

// const fullCompany =
//   await companyAggregate.getCompanyFull(company.id);
