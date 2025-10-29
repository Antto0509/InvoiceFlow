"use server";
import "server-only";

import type { Item } from "@/schemas/items.schema";
import type { InvoiceDb, InvoiceDetail } from "@/schemas/invoices.schema";
import { createClient } from "@/data/supabase/server";

/** Détail facture (serveur) — tu l’avais déjà */
export async function getInvoiceDetailServer(id: string): Promise<InvoiceDetail> {
  const sb = createClient();

  const { data, error } = await sb
    .from("invoices")
    .select("*, items(*), clients:clients(id, name, address, company)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Invoice not found");

  const detail: InvoiceDetail = {
    ...(data as InvoiceDb),
    items: (data.items ?? []) as Item[],
    client: data.clients
      ? {
          id: data.client_id,
          name: data.clients.name,
          address: data.clients.address,
          company: data.clients.company,
        }
      : null,
  };

  return detail;
}

/** Update facture (serveur) — pour mettre à jour pdf_url ou autre */
export async function updateInvoiceServer(
  id: string,
  patch: Partial<InvoiceDb>
): Promise<InvoiceDb> {
  const sb = createClient();
  const { data, error } = await sb
    .from("invoices")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as InvoiceDb;
}
