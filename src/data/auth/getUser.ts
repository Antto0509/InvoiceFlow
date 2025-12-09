import { createClientServer } from "@/data/supabase/server";

export async function getUser() {
  const supabase = createClientServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}
