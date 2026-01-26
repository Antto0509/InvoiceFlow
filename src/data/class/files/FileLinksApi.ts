import { ResourceApi } from "../ResourceApi";
import type { FileTarget } from "@/schemas/files.schema";

/**
 * API dédiée à la table `file_links`
 */
export class FileLinksApi extends ResourceApi<FileTarget> {
  constructor() {
    super({
      table: "file_links",
      select: "*",
      sortableColumns: [
        "file_id",
        "target_table",
        "target_id",
        "created_at",
      ],
      searchColumns: ["target_table"],
      primaryKey: ["file_id", "target_table", "target_id"],
      conflictTarget: ["file_id", "target_table", "target_id"],
    });
  }

  /**
   * Liste des liens pour un fichier donné
   * @param fileId Identifiant du fichier
   * @returns Liste des liens associés au fichier
   */
  listByFile(fileId: string) {
    return this.list({
      page: 1,
      pageSize: 100,
      filters: { file_id: { op: "eq", value: fileId } },
      sort: { column: "created_at", dir: "asc" },
    });
  }
}
