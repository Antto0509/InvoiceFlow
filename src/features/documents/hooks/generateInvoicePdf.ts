import { renderToBuffer, DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { InvoiceDetail, InvoicePdfData } from "@/schemas/invoices.schema";
import { createClient as createServerClient } from "@/data/supabase/client";
import { getInvoiceDetailServer } from "@/data/invoices.repository.server";
import InvoicePDF from "@/features/documents/components/pdf/InvoicePDF";

/**
 * Récupère les données nécessaires à la génération du PDF d’une facture.
 * 
 * @param invoiceId 
 * @param userId 
 * @returns Les données formatées pour le PDF.
 */
export async function fetchInvoicePdfData(invoiceId: string, userId: string): Promise<InvoicePdfData> {
  // getInvoiceDetail doit s'exécuter avec RLS et la session serveur (cookies)
  const inv = await getInvoiceDetailServer(invoiceId);
  if (!inv) throw new Error("Not found");

  const invoice: InvoiceDetail = inv as InvoiceDetail;
  if (!invoice || invoice.user_id !== userId) throw new Error("Not found");

  const items = invoice.items ?? [];
  const client = invoice.client ?? null;

  return {
    number: invoice.number,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    currency_code: invoice.currency_code,
    client: {
      name: client?.name,
      address: client?.address,
      company: client?.company,
    },
    items: items.map((it) => ({
      description: it.description,
      qty: Number(it.qty),
      unit_price: Number(it.unit_price),
    })),
    subtotal: Number(invoice.subtotal),
    tax: invoice.tax != null ? Number(invoice.tax) : null,
    total: Number(invoice.total),
  };
}

/**
 * Génère un buffer PDF à partir des données de la facture.
 * @param data Les données de la facture.
 * @returns Un buffer contenant le PDF généré.
 */
export async function generateInvoicePdfBuffer(data: InvoicePdfData) {
  const element = React.createElement(InvoicePDF, { data }) as unknown as React.ReactElement<DocumentProps>;
  return await renderToBuffer(element);
}

/**
 * Upload le PDF de la facture dans Supabase Storage.
 * @param userId 
 * @param number 
 * @param buf 
 * @returns Le chemin de stockage du PDF.
 */
export async function uploadInvoicePdf(userId: string, number: string, buf: Buffer) {
  const supabase = createServerClient();
  const path = `${userId}/${number}.pdf`;
  const { error } = await supabase.storage.from("invoices").upload(path, buf, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) throw error;
  return path;
}

/**
 * Assure que le PDF de la facture existe.
 * @param invoiceId 
 * @param param1 
 * @returns Le buffer, le chemin de stockage (si stocké) et le nom de fichier.
 */
export async function ensurePdfForInvoice(invoiceId: string, { store = false }: { store?: boolean } = {}) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const data = await fetchInvoicePdfData(invoiceId, user.id);
  const buf = await generateInvoicePdfBuffer(data);

  let storedPath: string | null = null;
  if (store) {
    if (!data.number) throw new Error("Invoice number missing");
    storedPath = await uploadInvoicePdf(user.id, data.number, buf);
  }

  return { buffer: buf, path: storedPath, filename: `Facture-${data.number}.pdf` };
}
