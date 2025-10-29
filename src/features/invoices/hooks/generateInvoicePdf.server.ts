"use server";
import "server-only";

import { renderToBuffer, DocumentProps } from "@react-pdf/renderer";
import React from "react";
import InvoicePDF from "../components/pdf/InvoicePDF";
import { InvoiceDetail, InvoicePdfData } from "@/schemas/invoices.schema";
import { createClient } from "@/data/supabase/server";
import { getInvoiceDetailServer } from "../data/invoices.repository.server";

export async function fetchInvoicePdfData(invoiceId: string, userId: string): Promise<InvoicePdfData> {
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

export async function generateInvoicePdfBuffer(data: InvoicePdfData) {
    try {
        const element = React.createElement(InvoicePDF, { data }) as unknown as React.ReactElement<DocumentProps>;
        const buffer = await renderToBuffer(element);
        return buffer;
    } catch (error) {
        throw error;
    }
}

export async function uploadInvoicePdf(userId: string, number: string, buf: Buffer) {
  const supabase = createClient();
  const path = `${userId}/${number}.pdf`;
  const { error } = await supabase.storage.from("invoices").upload(path, buf, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) throw error;
  return path;
}

export async function ensurePdfForInvoice(invoiceId: string, { store = false }: { store?: boolean } = {}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
