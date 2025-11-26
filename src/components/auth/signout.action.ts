"use server";

import { createClientServer } from "@/data/supabase/server";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = createClientServer();
  await supabase.auth.signOut();
  redirect("/login");
}