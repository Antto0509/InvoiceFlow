import { createClient } from "@/data/supabase/client";
import { Item } from "@/schemas/items.schema";

/** Upsert d’items. */
export async function upsertItems(
  items: Partial<Item & { user_id?: string }>[],
  userId?: string
): Promise<number> {
  if (!items?.length) return 0;
  const sb = createClient();
  const payload = userId ? items.map((it) => ({ ...it, user_id: it.user_id ?? userId })) : items;
  const { error, data } = await sb.from("items").upsert(payload).select("id");
  if (error) throw error;
  return data?.length ?? 0;
}