import { NextResponse } from "next/server";
import { createClientServer } from "@/data/supabase";
import { renderEmailTemplate } from "@/features/emails/renderEmailTemplate";
import { emailSubjects } from "@/features/emails/document";
import { EMAIL_LOG_STATUSES } from "@/lib/constants";

// Type pour le contexte avec les params
type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
    const supabase = createClientServer();

    // ---------------------------------------------------------------------------
    // Auth
    // ---------------------------------------------------------------------------
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId } = await ctx.params;

    // ---------------------------------------------------------------------------
    // Fetch document + client + company
    // ---------------------------------------------------------------------------
    const { data: document, error: docError } = await supabase
        .from("documents")
        .select(`
            *,
            client:clients (*),
            company:companies (*)
        `)
        .eq("id", documentId)
        .eq("user_id", user.id)
        .single();

    if (docError || !document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!document.client?.email) {
        return NextResponse.json(
            { error: "Client has no email" },
            { status: 400 }
        );
    }

    if (!document.pdf_url) {
        return NextResponse.json(
            { error: "PDF not generated" },
            { status: 400 }
        );
    }

    // ---------------------------------------------------------------------------
    // Anti double envoi (AVANT création du log)
    // ---------------------------------------------------------------------------
    const { data: existingLog } = await supabase
        .from("email_logs")
        .select("id")
        .eq("document_id", document.id)
        .eq("status", "sent")
        .maybeSingle();

    if (existingLog) {
        return NextResponse.json(
            { error: "Email déjà envoyé pour ce document" },
            { status: 409 }
        );
    }

    // ---------------------------------------------------------------------------
    // Variables email
    // ---------------------------------------------------------------------------
    type EmailKind = keyof typeof emailSubjects;
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
            total: document.total?.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
            }),
            currency: document.currency_code,
            issue_date: document.issue_date,
            due_date: document.due_date,
        },
    };

    const kind = document.kind as string;

    if (!kind || !(kind in emailSubjects)) {
        return NextResponse.json({ error: "Invalid document kind" }, { status: 400 });
    }

    const typedKind = kind as EmailKind;

    // ---------------------------------------------------------------------------
    // Render email
    // ---------------------------------------------------------------------------
    const { /* html, text */ } = renderEmailTemplate({
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
            status: "pending" as typeof EMAIL_LOG_STATUSES[number],
        })
        .select()
        .single();

    if (logError || !emailLog) {
        return NextResponse.json(
            { error: "Failed to create email log" },
            { status: 500 }
        );
    }

    // ---------------------------------------------------------------------------
    // Send email (placeholder)
    // ---------------------------------------------------------------------------
    try {
        // TODO: brancher Brevo ici
        // await brevo.sendTransacEmail({
        //     to: [{ email: vars.client.email, name: vars.client.name }],
        //     subject,
        //     htmlContent: html,
        //     textContent: text,
        //     attachment: [
        //         {
        //         url: document.pdf_url,
        //         name: `${document.number}.pdf`,
        //         },
        //     ],
        // });

        await supabase
        .from("email_logs")
        .update({ status: "sent" })
        .eq("id", emailLog.id);

        // Optionnel : update document.status = sent
        if (document.status === "draft") {
        await supabase
            .from("documents")
            .update({ status: "sent" })
            .eq("id", document.id);
        }

        return NextResponse.json({ success: true });
    } catch {
        await supabase
        .from("email_logs")
        .update({ status: "failed" })
        .eq("id", emailLog.id);

        return NextResponse.json(
        { error: "Email sending failed" },
        { status: 500 }
        );
    }
}
