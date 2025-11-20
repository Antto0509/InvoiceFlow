"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/data/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Merci de renseigner ton email.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Impossible d’envoyer l’email.");
        return;
      }

      toast.success(
        "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé ✉️"
      );
    } catch (err) {
      console.error(err);
      toast.error("Erreur inattendue. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6 bg-background/80 backdrop-blur border rounded-xl shadow-sm p-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Mot de passe oublié
          </h1>
          <p className="text-sm text-muted-foreground">
            On t’envoie un lien pour en définir un nouveau.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="toi@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !email}
          >
            {loading ? "Envoi..." : "Envoyer le lien"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Tu te souviens finalement ?{" "}
          <Link
            href="/login"
            className="font-medium underline underline-offset-4"
          >
            Revenir à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
