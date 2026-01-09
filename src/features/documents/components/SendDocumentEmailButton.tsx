"use client";

import * as React from "react";
import { toast } from "sonner";
import { Mail, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  documentId: string;
  kind: "invoice" | "quote" | "credit_note" | "proforma";
  alreadySent?: boolean;
};

export function SendDocumentEmailButton({
  documentId,
  kind,
  alreadySent = false,
}: Props) {
  const [loading, setLoading] = React.useState(false);

  async function handleSend() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/documents/${documentId}/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Erreur inconnue");
      }

      toast.success("Email envoyé avec succès");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Échec de l’envoi de l’email");
    } finally {
      setLoading(false);
    }
  }

  if (alreadySent) {
    return (
      <Button variant="secondary" disabled className="gap-2">
        <Check className="h-4 w-4" />
        Email déjà envoyé
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSend}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      Envoyer par email
    </Button>
  );
}
