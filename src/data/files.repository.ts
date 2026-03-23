import { ResourceApi } from "@/data/class/ResourceApi";
import { isDev } from "@/lib/env";
import type {
  File,
  FileTarget,
  FileWithDetail,
  FileListParams,
} from "@/schemas/files.schema";

/* ---------------------------------- */
/*           Files API core           */
/* ---------------------------------- */

/** Factory pour l’API fichiers (scopée éventuellement par user_id) */
export const makeFilesApi = (user_id?: string) =>
  new ResourceApi<File>({
    table: "files",
    select: "id, user_id, bucket, path, mime_type, size_bytes, created_at",
    sortableColumns: ["id", "user_id", "bucket", "path", "mime_type", "size_bytes", "created_at"],
    searchColumns: ["bucket", "path", "mime_type"],
    defaultFilters: user_id ? { user_id: { op: "eq", value: user_id } } : undefined,
    protectedColumns: ["user_id"],
    primaryKey: "id",
    conflictTarget: "id",
  });

/** Factory pour l’API de liaisons fichier → cible */
export const makeFileTargetsApi = () =>
  new ResourceApi<FileTarget>({
    table: "file_links",
    select: "file_id, target_table, target_id, created_at",
    sortableColumns: ["file_id", "target_table", "target_id", "created_at"],
    searchColumns: ["target_table"],
    primaryKey: ["file_id", "target_table", "target_id"],
    conflictTarget: ["file_id", "target_table", "target_id"],
  });

export const filesApi = makeFilesApi();
export const fileTargetsApi = makeFileTargetsApi();

/* ---------------------------------- */
/*        Recherche / Listing         */
/* ---------------------------------- */

/** Recherche rapide (autocomplete) sur les fichiers */
export async function searchFiles(
  { q, limit = 20, signal }: { q?: string; limit?: number; signal?: AbortSignal },
  userId?: string
): Promise<Array<{ id: string; bucket: string; path: string; mime_type?: string | null }>> {
  const api = makeFilesApi(userId);

  try {
    const { data } = await api.list({
      page: 1,
      pageSize: limit,
      search: q,
      sort: { column: "created_at", dir: "desc" },
      signal,
    });

    return data
      .filter(
        (f): f is File & { id: string } =>
          typeof f.id === "string"
      )
      .map((f) => ({
        id: f.id,
        bucket: f.bucket,
        path: f.path,
        mime_type: f.mime_type ?? null,
      }));
  } catch (err) {
    if (isDev) console.error("[FilesApi:searchFiles] Failed", { q, limit, userId }, err);
    throw err;
  }
}

/** Liste paginée des fichiers avec quelques filtres simples */
export async function listFiles(
  params: FileListParams = {},
  userId?: string
) {
  const {
    page = 1,
    pageSize = 20,
    search,
    bucket,
    mimeType,
    dateFrom,
    dateTo,
    sort = { column: "created_at", dir: "desc" as const },
    signal,
  } = params;

  const api = makeFilesApi(userId);

  try {
    const { data, total } = await api.list({
      page,
      pageSize,
      search,
      sort,
      signal,
      filters: {
        ...(bucket ? { bucket: { op: "eq", value: bucket } } : {}),
        ...(mimeType ? { mime_type: { op: "eq", value: mimeType } } : {}),
        ...(dateFrom ? { created_at: { op: "gte", value: dateFrom } } : {}),
        ...(dateTo ? { created_at: { op: "lte", value: dateTo } } : {}),
      },
    });

    return { rows: data as File[], total };
  } catch (err) {
    if (isDev) console.error("[FilesApi:listFiles] Failed", { params, userId }, err);
    throw err;
  }
}

/* ---------------------------------- */
/*             CRUD Files             */
/* ---------------------------------- */

export const getFile = (id: string, user_id?: string) =>
  makeFilesApi(user_id).get(id);

/** Création de fichier (id + created_at gérés par la DB) */
export const createFile = (file: Omit<File, "id" | "created_at">) =>
  makeFilesApi().create(file);

export const updateFile = (id: string, payload: Partial<File>, user_id?: string) =>
  makeFilesApi(user_id).update(id, payload);

export const deleteFile = (id: string, user_id?: string) =>
  makeFilesApi(user_id).remove(id);

export const bulkDeleteFiles = (ids: string[], user_id?: string) =>
  makeFilesApi(user_id).bulkDelete(ids);

/* ---------------------------------- */
/*          CRUD File Targets         */
/* ---------------------------------- */

/** Récupère une liaison fichier → cible précise (PK composite) */
export const getFileTarget = (fileId: string, targetTable: string, targetId: string) =>
  makeFileTargetsApi().get([fileId, targetTable, targetId]);

/** Liste toutes les cibles d’un fichier donné */
export const listFileTargetsByFile = (fileId: string) =>
  makeFileTargetsApi().list({
    page: 1,
    pageSize: 100,
    filters: { file_id: { op: "eq", value: fileId } },
    sort: { column: "created_at", dir: "asc" },
  });

/** Crée/attache une liaison fichier → cible */
export const createFileTarget = (payload: Partial<FileTarget>) =>
  makeFileTargetsApi().create(payload);

/** Supprime une liaison fichier → cible */
export const deleteFileTarget = (fileId: string, targetTable: string, targetId: string) =>
  makeFileTargetsApi().remove([fileId, targetTable, targetId]);

/* ---------------------------------- */
/*  Aggregation: file + target detail */
/* ---------------------------------- */

/**
 * Récupère un fichier + première cible associée.
 * Remonte un objet typé `FileWithDetail`.
 *
 * @param id Identifiant du fichier
 * @param userId (optionnel) Filtrage par utilisateur propriétaire
 */
export async function getFileWithDetails(
  id: string,
  userId?: string
): Promise<FileWithDetail> {
  try {
    const [file, { data: links }] = await Promise.all([
      getFile(id, userId),
      listFileTargetsByFile(id),
    ]);

    const target = Array.isArray(links) && links.length > 0
      ? (links[0] as FileTarget)
      : undefined;

    return {
      ...(file as File),
      target,
    };
  } catch (err) {
    if (isDev) console.error("[FilesApi:getFileWithDetails] Failed", { id, userId }, err);
    throw err;
  }
}
