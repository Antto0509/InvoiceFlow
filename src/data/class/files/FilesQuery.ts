import type { FileWithDetail, FileTarget } from "@/schemas/files.schema";
import { FilesApi } from "./filesApi";
import { FileLinksApi } from "./FileLinksApi";

/**
 * Récupère un fichier avec ses détails (liens)
 * @param id Identifiant du fichier
 * @param userId Identifiant de l’utilisateur (optionnel)
 * @returns Fichier avec détails
 */
export async function getFileWithDetails(
  id: string,
  userId?: string
): Promise<FileWithDetail> {
  const filesApi = new FilesApi(userId);
  const linksApi = new FileLinksApi();

  const [file, { data: links }] = await Promise.all([
    filesApi.get(id),
    linksApi.listByFile(id),
  ]);

  const target =
    Array.isArray(links) && links.length > 0
      ? (links[0] as FileTarget)
      : undefined;

  return {
    ...(file),
    target,
  };
}
