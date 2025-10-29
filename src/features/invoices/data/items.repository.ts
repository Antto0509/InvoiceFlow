import { createResourceApi } from "@/data/createResourceApi";
import { createClient } from "@/data/supabase/client";
import { stripGeneratedMany } from "@/lib/utils";
import { Item, ItemListRow } from "@/schemas/items.schema";
import { SORTABLE_ITEMS } from "@/lib/constants";

// ---- Items API ----

/** API dédiée pour la liste (sélection + jointure client) */
const makeItemsListApi = (userId?: string) =>
  createResourceApi<ItemListRow>({
    table: "items",
    sortableColumns: [...SORTABLE_ITEMS],
    searchColumns: ["name", "description"],
    defaultFilters: userId ? { user_id: { op: "eq", value: userId } } : undefined,
  });

/** Recherche rapide (autocomplete) */
export async function searchItems(
  { q, limit = 20, signal }: { q?: string; limit?: number; signal?: AbortSignal },
  userId?: string
): Promise<Array<{ id: string; description: string }>> {
  const api = makeItemsListApi(userId);
  const { data } = await api.list({
    page: 1,
    pageSize: limit,
    search: q,
    sort: { column: "created_at", dir: "desc" },
    signal,
  });
  return data.map((it) => ({
    id: it.id,
    description: it.description,
  }));
}

/** Upsert (insert ou update) une liste d'items */
export async function upsertItems(
  items: Partial<Item & { user_id?: string }>[],
  userId?: string
): Promise<number> {
  if (!items?.length) return 0;
  const sb = createClient();

  const withUser = userId ? items.map((it) => ({ ...it, user_id: it.user_id ?? userId })) : items;
  const payload = stripGeneratedMany(withUser as Record<string, unknown>[]);

  const { error, data } = await sb.from("items").upsert(payload).select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

// ---- CRUD Items

export const getItem = (id: string, userId?: string) => makeItemsListApi(userId).get(id);
export const createItem = (payload: Partial<Item & { user_id?: string }>, userId?: string) =>
  makeItemsListApi(userId).create(payload);
export const updateItem = (id: string, payload: Partial<Item & { user_id?: string }>, userId?: string) =>
  makeItemsListApi(userId).update(id, payload);
export const removeItem = (id: string, userId?: string) => makeItemsListApi(userId).remove(id);
export const bulkDeleteItems = (ids: string[], userId?: string) =>
  makeItemsListApi(userId).bulkDelete(ids);