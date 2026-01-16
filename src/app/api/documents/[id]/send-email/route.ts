import { NextResponse } from "next/server";
import { createClientServer } from "@/data/supabase";
import { sendBrevoTransacEmail } from "@/data/brevo";
import { renderEmailTemplate } from "@/features/emails/renderEmailTemplate";
import { emailSubjects, EmailVars, EmailKind } from "@/features/emails/document";
import { EMAIL_LOG_STATUSES } from "@/lib/constants";
import {
  isValidEmail,
  normalizeBrevoError,
  mapBrevoToUserMessage,
  userError,
  safeUpdateEmailLog,
} from "@/lib/utils";
import { getOrCreateSignedDocumentPdfUrlWithClient } from "@/features/documents/hooks/signDocumentPdf";
import { DocumentKind } from "@/features/documents";

// Type pour le contexte avec les params
type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const traceId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `trace_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const supabase = createClientServer();

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return userError(401, "UNAUTHORIZED", "Connexion requise.", traceId);
  }

  const { id: documentId } = await ctx.params;

  // ---------------------------------------------------------------------------
  // Fetch document + client + company
  // ---------------------------------------------------------------------------
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select(
      `
        *,
        client:clients (*),
        company:companies (*)
      `
    )
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();

  if (docError || !document) {
    return userError(404, "DOCUMENT_NOT_FOUND", "Document introuvable.", traceId);
  }

  // checks “user-friendly”
  if (!isValidEmail(document.client?.email)) {
    console.error("[InvoiceFlow][EmailSend] client_email_invalid", {
      traceId,
      userId: user.id,
      documentId: document.id,
      clientEmail: document.client?.email,
    });

    return userError(
      400,
      "CLIENT_EMAIL_MISSING",
      "Le client n’a pas d’adresse email valide.",
      traceId
    );
  }

  if (!isValidEmail(document.company?.email)) {
    console.error("[InvoiceFlow][EmailSend] company_email_invalid", {
      traceId,
      userId: user.id,
      documentId: document.id,
      companyEmail: document.company?.email,
    });

    return userError(
      400,
      "COMPANY_EMAIL_INVALID",
      "L’email de l’entreprise est invalide. Mets-le à jour dans les paramètres.",
      traceId
    );
  }

  // ---------------------------------------------------------------------------
  // Anti double envoi
  // ---------------------------------------------------------------------------
  const { data: existingLog } = await supabase
    .from("email_logs")
    .select("id")
    .eq("document_id", document.id)
    .in("status", ["sent", "pending"])
    .maybeSingle();

  if (existingLog) {
    return userError(
      409,
      "EMAIL_ALREADY_SENT",
      "Email déjà envoyé pour ce document.",
      traceId
    );
  }

  // ---------------------------------------------------------------------------
  // Variables email
  // ---------------------------------------------------------------------------
  const vars: EmailVars = {
    client: {
      name: document.client.name,
      email: document.client.email,
    },
    company: {
      name: document.company.name,
      email: document.company.email,
      website: document.company.website,
      legal_notes: document.company.legal_notes,
      bank_info: document.company.bank_info,
    },
    document: {
      kind: document.kind,
      number: document.number,
      total: document.total?.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
      }),
      currency: document.currency_code,
      issue_date: document.issue_date,
      due_date: document.due_date,
    },
  };

  const kind = document.kind as DocumentKind;

  if (!kind || !(kind in emailSubjects)) {
    console.error("[InvoiceFlow][EmailSend] document_kind_invalid", {
      traceId,
      userId: user.id,
      documentId: document.id,
      documentKind: document.kind,
    });

    return userError(
      400,
      "DOCUMENT_KIND_INVALID",
      "Type de document invalide.",
      traceId
    );
  }

  const typedKind = kind as EmailKind;

  // ---------------------------------------------------------------------------
  // Render email
  // ---------------------------------------------------------------------------
  const { html, text } = renderEmailTemplate({
    kind: typedKind,
    variables: vars,
  });

  const subject = emailSubjects[typedKind](vars);

  // ---------------------------------------------------------------------------
  // Log email (pending)
  // ---------------------------------------------------------------------------
  const { data: emailLog, error: logError } = await supabase
    .from("email_logs")
    .insert({
      user_id: user.id,
      document_id: document.id,
      to_email: document.client.email,
      subject,
      status: "pending" as (typeof EMAIL_LOG_STATUSES)[number],
      trace_id: traceId,
    })
    .select()
    .single();

  if (logError || !emailLog) {
    console.error("[InvoiceFlow][EmailSend] log_create_failed", {
      traceId,
      userId: user.id,
      documentId: document.id,
      error: logError,
    });

    return userError(
      500,
      "EMAIL_LOG_CREATE_FAILED",
      "Impossible de préparer l’envoi de l’email. Réessaie.",
      traceId
    );
  }

  // ---------------------------------------------------------------------------
  // PDF signed URL
  // ---------------------------------------------------------------------------
  let pdfSignedUrl: string;
  let pdfPath: string | null = null;

  try {
    // 15 minutes: Brevo a le temps de fetch
    const signed = await getOrCreateSignedDocumentPdfUrlWithClient(
      supabase,
      user.id,
      document.id,
      { expiresIn: 900, force: false }
    );

    pdfSignedUrl = signed.signedUrl;
    pdfPath = signed.pdfPath;
  } catch (e) {
    console.error("[InvoiceFlow][EmailSend] signed_pdf_url_failed", {
      traceId,
      userId: user.id,
      documentId: document.id,
      pdfPath: document.pdf_url,
      error: e,
    });

    await safeUpdateEmailLog(
      supabase,
      emailLog.id,
      {
        status: "failed",
        provider: "brevo",
        trace_id: traceId,
      },
      { status: "failed" }
    );

    return userError(
      400,
      "PDF_NOT_READY",
      "Le PDF n’est pas disponible pour l’instant. Génère le PDF puis réessaie.",
      traceId
    );
  }

  // ---------------------------------------------------------------------------
  // Send email (Brevo)
  // ---------------------------------------------------------------------------
  try {
    const brevoRes = await sendBrevoTransacEmail({
      replyTo: {
        email: document.company.email,
        name: document.company.name,
      },
      sender: {
        email: process.env.NEXT_PUBLIC_SENDER_EMAIL || "no-reply@reelium.fr",
        name: process.env.NEXT_PUBLIC_SENDER_NAME || "InvoiceFlow",
      },
      to: [
        {
          email: vars.client.email!,
          ...(vars.client.name ? { name: vars.client.name } : {}),
        },
      ],
      subject,
      htmlContent: html,
      textContent: text,
      attachment: [{ url: pdfSignedUrl, name: `${document.number}.pdf` }],
      headers: {
        "X-InvoiceFlow-Trace-Id": traceId,
        "X-InvoiceFlow-Document-Id": String(document.id),
        "X-InvoiceFlow-EmailLog-Id": String(emailLog.id),
        ...(pdfPath ? { "X-InvoiceFlow-Pdf-Path": pdfPath } : {}),
      },
    });

    await safeUpdateEmailLog(
      supabase,
      emailLog.id,
      {
        status: "sent",
        provider: "brevo",
        provider_message_id:
          brevoRes.messageId ?? brevoRes.messageIds?.[0] ?? null,
        trace_id: traceId,
      },
      { status: "sent" }
    );

    // Met à jour le statut du document si draft
    if (document.status === "draft") {
      const { error: docUpdateErr } = await supabase
        .from("documents")
        .update({ status: "sent" })
        .eq("id", document.id);

      if (docUpdateErr) {
        console.warn("[InvoiceFlow][EmailSend] document_status_update_failed", {
          traceId,
          documentId: document.id,
          error: docUpdateErr,
        });
      }
    }

    return NextResponse.json({ ok: true, traceId });
  } catch (err) {
    const brevo = normalizeBrevoError(err);
    const mapped = mapBrevoToUserMessage(brevo.status);

    console.error("[InvoiceFlow][EmailSend] brevo_send_failed", {
      traceId,
      userId: user.id,
      documentId: document.id,
      emailLogId: emailLog.id,
      to: document.client.email,
      subject,
      brevoStatus: brevo.status,
      brevoMessage: brevo.message,
      brevoPayload: brevo.payload,
      pdfPath,
    });

    await safeUpdateEmailLog(
      supabase,
      emailLog.id,
      {
        status: "failed",
        provider: "brevo",
        error_code: mapped.code,
        error_message: brevo.message,
        error_details: brevo.payload ?? null,
        trace_id: traceId,
      },
      { status: "failed" }
    );

    return userError(mapped.http, mapped.code, mapped.message, traceId);
  }
}
