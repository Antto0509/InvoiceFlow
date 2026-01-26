import { ResourceApi } from "../ResourceApi";
import type { DocumentSequence } from "@/schemas/documents.schema";

/**
 * API CRUD pour les séquences de numérotation des documents
 */
export class DocumentSequencesApi extends ResourceApi<DocumentSequence> {
  constructor() {
    super({
      table: "document_sequences",
      select: "*",
      sortableColumns: ["year", "kind", "next_number"],
      searchColumns: [],
      protectedColumns: ["next_number"],
    });
  }
}
