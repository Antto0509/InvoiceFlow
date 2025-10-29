import { createClient } from "@/data/supabase/server";
import { ensurePdfForInvoice } from "./generateInvoicePdf.server";
import { getInvoiceDetailServer, updateInvoiceServer } from "@/data/invoices.repository.server";

export async function getOrCreateSignedInvoicePdfUrl(
  invoiceId: string,
  opts: { expiresIn?: number; force?: boolean } = {}
) {
  const { expiresIn = 300, force = false } = opts;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const inv = await getInvoiceDetailServer(invoiceId);
  if (!inv || inv.user_id !== user.id) throw new Error("Not found");

  let path = inv.pdf_url;

  if (!path || force) {
    const { path: newPath } = await ensurePdfForInvoice(invoiceId, { store: true });
    if (!newPath) throw new Error("PDF generation failed");

    await updateInvoiceServer(invoiceId, { pdf_url: newPath });
    path = newPath;
  }

  const { data, error } = await supabase.storage
    .from("invoices")
    .createSignedUrl(path, expiresIn, {
      download: `Facture-${inv.number ?? invoiceId}.pdf`,
    });

  if (error) throw error;
  return data.signedUrl;
}
