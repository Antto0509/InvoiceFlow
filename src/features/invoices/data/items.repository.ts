import { createClient } from "@/data/supabase/client";
import { stripGeneratedMany } from "@/lib/utils";
import { Item } from "@/schemas/items.schema";

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