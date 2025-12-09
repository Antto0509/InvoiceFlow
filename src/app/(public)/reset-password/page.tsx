"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/data/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setHasSession(false);
      } else {
        setHasSession(true);
      }
      setCheckingSession(false);
    };

    void checkSession();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasSession) {
      toast.error("Lien invalide ou expiré. Recommence la procédure.");
      return;
    }

    const trimmedPassword = password.trim();
    const trimmedConfirm = passwordConfirm.trim();

    if (trimmedPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.updateUser({
        password: trimmedPassword,
      });

      if (error) {
        toast.error(error.message || "Impossible de mettre à jour le mot de passe.");
        return;
      }

      toast.success("Mot de passe mis à jour. Tu peux te reconnecter.");
      router.push("/login");
    } catch (err) {
      console.error(err);
      toast.error("Erreur inattendue. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
        <div className="w-full max-w-sm bg-background/80 backdrop-blur border rounded-xl shadow-sm p-6 text-center text-sm text-muted-foreground">
          Vérification du lien…
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
        <div className="w-full max-w-sm bg-background/80 backdrop-blur border rounded-xl shadow-sm p-6 space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Le lien de réinitialisation est invalide ou a expiré.
          </p>
          <Link
            href="/forgot-password"
            className="text-sm font-medium underline underline-offset-4"
          >
            Recommencer la procédure
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6 bg-background/80 backdrop-blur border rounded-xl shadow-sm p-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Nouveau mot de passe
          </h1>
          <p className="text-sm text-muted-foreground">
            Choisis un nouveau mot de passe pour sécuriser ton compte.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Nouveau mot de passe
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum 8 caractères.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="passwordConfirm"
              className="text-sm font-medium text-foreground"
            >
              Confirmation
            </label>
            <Input
              id="passwordConfirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              loading || !password || !passwordConfirm
            }
          >
            {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </Button>
        </form>
      </div>
    </div>
  );
}
