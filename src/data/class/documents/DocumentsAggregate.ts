import { DocumentsApi } from "./DocumentsApi";
import { DocumentsListViewApi } from "./DocumentsListViewApi";
import { DocumentLinesApi } from "./DocumentLinesApi";
import type { Document, DocumentLine } from "@/schemas/documents.schema";

/**
 * Agrégat pour la gestion des documents avec lignes
 */
export class DocumentsAggregate {
  constructor(private userId?: string) {}

  // =====================
  // Lecture
  // =====================

  /**
   * Liste des documents
   * @param params Paramètres de liste
   * @returns Liste des documents
   */
  list(params = {}) {
    return new DocumentsListViewApi(this.userId).list(params);
  }

  /**
   * Détail d’un document
   * @param id ID du document
   * @returns Document avec lignes
   */
  get(id: string) {
    return new DocumentsApi(this.userId).get(id);
  }

  /**
   * Détail d’un document avec lignes
   * @param id ID du document
   * @returns Document avec lignes
   */
  async getDetail(id: string) {
    const docs = new DocumentsApi(this.userId);
    const lines = new DocumentLinesApi();

    const document = await docs.get(id);
    if (!document) return null;

    const documentLines = await lines.listByDocument(id);

    return {
      ...document,
      lines: documentLines,
    };
  }

  // =====================
  // Écriture
  // =====================

  /**
   * Création d’un brouillon avec lignes
   * @param payload Données du document + lignes
   * @return Document brouillon créé
   */
  async createDraftWithLines(
    payload: Partial<Document & { lines?: Partial<DocumentLine>[] }>
  ) {
    const docs = new DocumentsApi(this.userId);
    const lines = new DocumentLinesApi();

    const { lines: docLines, ...doc } = payload;

    const created = await docs.create({
      ...doc,
      status: "draft",
      number: null,
      number_readonly: null,
    });

    if (!created?.id) throw new Error("Draft creation failed");

    if (docLines?.length) {
      await lines.upsert(
        docLines.map((l) => ({ ...l, document_id: created.id }))
      );
    }

    return created;
  }

  /**
   * Finalisation d’un brouillon (UPDATE + RPC)
   * @param documentId ID du document brouillon
   * @return Document finalisé
   */
  async finalizeDraft(documentId: string) {
    const docs = new DocumentsApi(this.userId);

    const draft = await docs.get(documentId);
    if (!draft) throw new Error("Document not found");
    if (draft.status !== "draft") {
      throw new Error("Document already finalized");
    }

    // Vérité absolue : la DB
    const numbering = await docs.generateNumber({
      company_id: draft.company_id,
      kind: draft.kind,
      issue_date: draft.issue_date,
    });

    return docs.update(documentId, {
      status: "finalized",
      number: numbering.number_value,
      number_readonly: numbering.number_readonly,
    });
  }

  /**
   * ⚠️ Création directe (CAS EXCEPTIONNEL UNIQUEMENT)
   * - imports
   * - migration
   * - admin
   * @param payload Données du document + lignes
   * @return Document final créé
   */
  async createFinalWithLines(
    payload: Partial<Document & { lines?: Partial<DocumentLine>[] }>
  ) {
    const docs = new DocumentsApi(this.userId);
    const lines = new DocumentLinesApi();

    if (payload.status !== "finalized") {
      throw new Error("Final document must have status=finalized");
    }

    if (!payload.number) {
      throw new Error("Final document must have a number");
    }

    const { lines: docLines, ...doc } = payload;

    const created = await docs.create(doc);
    if (!created?.id) throw new Error("Creation failed");

    if (docLines?.length) {
      await lines.upsert(
        docLines.map((l) => ({ ...l, document_id: created.id }))
      );
    }

    return created;
  }

  /**
   * Remplacement total des lignes (indépendant du statut)
   * @param documentId ID du document
   * @param incoming Lignes entrantes
   * @return Résultat de l’opération
   */
  async replaceLines(
    documentId: string,
    incoming: Array<Partial<DocumentLine>>
  ) {
    const linesApi = new DocumentLinesApi();

    const existing = await linesApi.listByDocument(documentId);
    const existingIds = new Set(existing.map((l) => l.id));

    const incomingWithDoc = incoming.map((l) => ({
      ...l,
      document_id: documentId,
    }));

    await linesApi.upsert(incomingWithDoc);

    const incomingIds = new Set(
      incomingWithDoc.map((l) => l.id).filter(Boolean) as string[]
    );

    const toDelete = [...existingIds].filter(
      (id) => id && !incomingIds.has(id)
    );

    if (toDelete.length) {
      await linesApi.deleteMany(toDelete);
    }

    return {
      upserted: incomingWithDoc.length,
      deleted: toDelete.length,
    };
  }
}
