import { ResourceApi } from "../ResourceApi";
import type { File, FileListParams } from "@/schemas/files.schema";

/**
 * API dédiée à la table `files`
 */
export class FilesApi extends ResourceApi<File> {
  constructor(userId?: string) {
    super({
      table: "files",
      select: "id, user_id, bucket, path, mime_type, size_bytes, created_at",
      sortableColumns: [
        "id",
        "user_id",
        "bucket",
        "path",
        "mime_type",
        "size_bytes",
        "created_at",
      ],
      searchColumns: ["bucket", "path", "mime_type"],
      defaultFilters: userId
        ? { user_id: { op: "eq", value: userId } }
        : undefined,
      protectedColumns: ["user_id"],
      primaryKey: "id",
      conflictTarget: "id",
    });
  }

  /** 
   * Autocomplete / recherche rapide 
   * @param q Terme de recherche
   * @param limit Nombre maximum de résultats
   * @param signal Signal d'annulation
   * @returns Liste des fichiers trouvés
   */
  async search({
    q,
    limit = 20,
    signal,
  }: {
    q?: string;
    limit?: number;
    signal?: AbortSignal;
  }) {
    const { data } = await this.list({
      page: 1,
      pageSize: limit,
      search: q,
      sort: { column: "created_at", dir: "desc" },
      signal,
    });

    return data.map(({ id, bucket, path, mime_type }) => ({
      id,
      bucket,
      path,
      mime_type: mime_type ?? null,
    }));
  }

  /** 
   * Listing filtré 
   * @param params Paramètres de la liste
   * @returns Liste des fichiers avec total
   */
  async listFiles(params: FileListParams = {}) {
    const {
      page = 1,
      pageSize = 20,
      search,
      bucket,
      mimeType,
      dateFrom,
      dateTo,
      sort = { column: "created_at", dir: "desc" },
      signal,
    } = params;

    return this.list({
      page,
      pageSize,
      search,
      sort,
      signal,
      filters: {
        ...(bucket && { bucket: { op: "eq", value: bucket } }),
        ...(mimeType && { mime_type: { op: "eq", value: mimeType } }),
        ...(dateFrom && { created_at: { op: "gte", value: dateFrom } }),
        ...(dateTo && { created_at: { op: "lte", value: dateTo } }),
      },
    });
  }
}
