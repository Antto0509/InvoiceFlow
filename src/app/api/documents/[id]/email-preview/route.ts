import { NextResponse } from "next/server";
import { createClientServer } from "@/data/supabase";
import { renderEmailTemplate } from "@/features/emails/renderEmailTemplate";
import { emailSubjects } from "@/features/emails/document";

// Type pour le contexte avec les params
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const supabase = createClientServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: documentId } = await ctx.params;

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
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (!document.client?.email) {
    return NextResponse.json({ error: "Client has no email" }, { status: 400 });
  }

  if (!document.pdf_url) {
    return NextResponse.json({ error: "PDF not generated" }, { status: 400 });
  }

  // Anti double envoi (info utile à la preview)
  const { data: existingLog } = await supabase
    .from("email_logs")
    .select("id")
    .eq("document_id", document.id)
    .eq("status", "sent")
    .maybeSingle();

  type EmailKind = keyof typeof emailSubjects;
  const kind = document.kind as EmailKind;

  if (!kind || !(kind in emailSubjects)) {
    return NextResponse.json({ error: "Invalid document kind" }, { status: 400 });
  }

  type EmailVars = Parameters<(typeof emailSubjects)[EmailKind]>[0];

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
      total: document.total?.toLocaleString("fr-FR", { minimumFractionDigits: 2 }),
      currency: document.currency_code,
      issue_date: document.issue_date,
      due_date: document.due_date,
    },
  };

  const { html, text } = renderEmailTemplate({
    kind,
    variables: vars,
  });

  const subject = emailSubjects[kind](vars);

  return NextResponse.json({
    to: vars.client.email,
    subject,
    html,
    text,
    pdf_url: document.pdf_url,
    alreadySent: !!existingLog,
    kind,
  });
}
