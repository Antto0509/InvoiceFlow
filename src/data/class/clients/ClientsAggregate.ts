import { ClientsApi } from "./ClientsApi";
import { ClientAddressesApi } from "./ClientAddressesApi";
import { ClientContactsApi } from "./ClientContactsApi";

import type {
  Client,
  ClientAddress,
  ClientContact,
  ClientWithDetails,
} from "@/schemas/clients.schema";

/**
 * API agrégée pour les clients et leurs données associées
 */
export class ClientsAggregate {
  constructor(private readonly companyId?: string) {}

  // =====================
  // Lecture
  // =====================

  /**
   * Liste des clients
   * @param params Paramètres de liste
   * @returns Liste des clients
   */
  async list(params = {}) {
    return new ClientsApi(this.companyId).listClients(params);
  }

  /**
   * Recherche des clients
   * @param q Terme de recherche
   * @param limit Nombre maximum de résultats
   * @returns Liste des clients
   */
  async search(q?: string, limit = 20) {
    return new ClientsApi(this.companyId).search(q, limit);
  }

  /**
   * Récupération d’un client
   * @param clientId ID du client
   * @returns Client trouvé ou erreur si non trouvé
   */
  async get(clientId: string): Promise<Client> {
    const client = await new ClientsApi(this.companyId).get(clientId);
    if (!client) throw new Error("Client not found");
    return client;
  }

  /**
   * Récupération d’un client avec ses adresses et contacts
   * @param clientId ID du client
   * @returns Client avec détails ou erreur si non trouvé
   */
  async getWithDetails(clientId: string): Promise<ClientWithDetails> {
    const clients = new ClientsApi(this.companyId);
    const addresses = new ClientAddressesApi(clientId);
    const contacts = new ClientContactsApi(clientId);

    const [client, addr, cont] = await Promise.all([
      clients.get(clientId),
      addresses.listAddresses({ page: 1, pageSize: 100 }),
      contacts.listContacts({ page: 1, pageSize: 100 }),
    ]);

    if (!client) throw new Error("Client not found");

    return {
      client,
      addresses: addr.rows,
      contacts: cont.rows,
    };
  }

  // =====================
  // Écriture
  // =====================

  /**
   * Création d’un client avec adresses et contacts
   * @param payload Données du client + adresses + contacts
   * @returns Client avec détails créés
   */
  async create(
    payload: Partial<Client> & {
      addresses?: Partial<ClientAddress>[];
      contacts?: Partial<ClientContact>[];
    }
  ): Promise<ClientWithDetails> {
    if (!payload.name) {
        throw new Error("Client name is required");
    }

    const clientsApi = new ClientsApi(this.companyId);
    const { addresses, contacts, ...clientData } = payload;

    const client = await clientsApi.create(clientData);
    if (!client?.id) throw new Error("Client creation failed");

    const addressesApi = new ClientAddressesApi(client.id);
    const contactsApi = new ClientContactsApi(client.id);

    try {
      const [createdAddresses, createdContacts] = await Promise.all([
        addresses?.length
          ? addressesApi.upsertMany(addresses.map((addr) => ({ ...addr, client_id: client.id })))
          : Promise.resolve([] as ClientAddress[]),
        contacts?.length
          ? contactsApi.upsertMany(contacts.map((cont) => ({ ...cont, client_id: client.id })))
          : Promise.resolve([] as ClientContact[]),
      ]);

      return {
        client,
        addresses: createdAddresses,
        contacts: createdContacts,
      };
    } catch (err) {
      // Rollback : suppression du client pour éviter les données orphelines
      await clientsApi.remove(client.id).catch(() => null);
      throw err;
    }
  }

  /**
   * Mise à jour d’un client
   * @param clientId ID du client
   * @param payload Données à mettre à jour
   * @returns Client mis à jour
   */
  async update(
    clientId: string,
    payload: Partial<Client>
  ): Promise<Client> {
    const clientsApi = new ClientsApi(this.companyId);

    const existing = await clientsApi.get(clientId);
    if (!existing) throw new Error("Client not found");

    return clientsApi.update(clientId, payload);
  }

  /**
   * Suppression d’un client et de ses données associées
   * @param clientId ID du client
   * @returns Résultat de la suppression
   */
  async remove(clientId: string) {
    const clientsApi = new ClientsApi(this.companyId);

    const existing = await clientsApi.get(clientId);
    if (!existing) throw new Error("Client not found");

    const addressesApi = new ClientAddressesApi(clientId);
    const contactsApi = new ClientContactsApi(clientId);

    // Récupérer les IDs des adresses et contacts
    const [addresses, contacts] = await Promise.all([
        addressesApi.listAddresses({ page: 1, pageSize: 100 }),
        contactsApi.listContacts({ page: 1, pageSize: 100 }),
    ]);

    // Suppression en masse
    await Promise.all([
        addresses.rows.length
            ? addressesApi.bulkDelete(addresses.rows.map((a) => a.id))
            : Promise.resolve(0),
        contacts.rows.length
            ? contactsApi.bulkDelete(contacts.rows.map((c) => c.id))
            : Promise.resolve(0),
    ]);

    // Suppression du client
    return clientsApi.remove(clientId);
  }
}
