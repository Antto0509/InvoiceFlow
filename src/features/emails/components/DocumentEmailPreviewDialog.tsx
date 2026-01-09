"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Check, ExternalLink } from "lucide-react";

type PreviewResponse = {
  to: string;
  subject: string;
  html: string;
  text: string;
  pdf_url: string;
  alreadySent: boolean;
  kind: string;
};

export function DocumentEmailPreviewDialog({
  documentId,
  kind,
  alreadySent = false,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  documentId: string;
  kind: string;
  alreadySent?: boolean;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const isControlled = typeof controlledOpen === "boolean" && !!controlledOnOpenChange;

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = isControlled ? (controlledOpen as boolean) : uncontrolledOpen;
  const setOpen = isControlled ? (controlledOnOpenChange as (v: boolean) => void) : setUncontrolledOpen;

  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [preview, setPreview] = React.useState<PreviewResponse | null>(null);

  const canOpen = !alreadySent;

  async function fetchPreview() {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/email-preview`, {
        method: "GET",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Impossible de charger la preview");
      setPreview(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur preview");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function sendEmail() {
    if (!preview) return;

    setSending(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur lors de l’envoi");

      toast.success("Email envoyé ✅");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec envoi email");
    } finally {
      setSending(false);
    }
  }

  // Charge la preview à l'ouverture + reset à la fermeture
  React.useEffect(() => {
    if (!open) {
      setPreview(null);
      return;
    }
    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, documentId]);

  if (!canOpen) {
    return (
      <Button variant="ghost" disabled className="gap-2">
        <Check className="h-4 w-4" />
        Email déjà envoyé
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger seulement en mode non-contrôlé */}
      {!isControlled ? (
        <DialogTrigger asChild>
          {children ?? (
            <Button variant="default" className="gap-2">
              <Mail className="h-4 w-4" />
              Prévisualiser & envoyer
            </Button>
          )}
        </DialogTrigger>
      ) : null}

      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            Prévisualisation email
            {preview?.alreadySent ? (
              <Badge variant="secondary">Déjà envoyé</Badge>
            ) : null}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 pb-6">
            {loading || !preview ? (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement…
            </div>
            ) : (
            <div className="space-y-4">
                <div className="rounded-lg border p-3 text-sm space-y-2">
                    <div>
                        <span className="text-muted-foreground">À :</span>{" "}
                        <span className="font-medium">{preview.to}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Sujet :</span>{" "}
                        <span className="font-medium">{preview.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="gap-2"
                            onClick={() =>
                                window.open(preview.pdf_url, "_blank", "noopener,noreferrer")
                            }
                        >
                        <ExternalLink className="h-4 w-4" />
                        Ouvrir le PDF
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="html">
                    <TabsList>
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="text">Texte</TabsTrigger>
                    </TabsList>

                    <TabsContent title="HTML" value="html">
                        <div className="rounded-lg border overflow-hidden">
                            <iframe
                                title="Email preview"
                                srcDoc={preview.html}
                                className="w-full h-[420px] border-0"
                                sandbox=""
                            />
                        </div>
                    </TabsContent>

                    <TabsContent title="Texte" value="text">
                        <pre className="rounded-lg border p-3 text-sm whitespace-pre-wrap">
                            {preview.text}
                        </pre>
                    </TabsContent>
                </Tabs>

                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={sending}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={sendEmail}
                        disabled={sending}
                        className="gap-2"
                    >
                        {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Mail className="h-4 w-4" />
                        )}
                        Envoyer
                    </Button>
                </div>
            </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
