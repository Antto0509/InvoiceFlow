"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/data/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedCompanyName = companyName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      toast.error("Prénom et nom sont obligatoires.");
      return;
    }

    if (trimmedPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          data: {
            first_name: trimmedFirstName,
            last_name: trimmedLastName,
            role: "owner", // par défaut, le créateur du compte
            company_name: trimmedCompanyName || null,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message || "Échec de la création du compte.");
        return;
      }

      toast.success(
        "Compte créé. Vérifie ta boîte mail pour confirmer ton adresse ✉️"
      );

      // Tu peux rediriger vers /login si tu veux forcer la connexion après confirmation
      // router.push("/login");
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
            Créer un compte
          </h1>
          <p className="text-sm text-muted-foreground">
            Paramètre ton espace InvoiceFlow en quelques secondes.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-foreground"
            >
              Prénom
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder="Antoine"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="text-sm font-medium text-foreground"
            >
              Nom
            </label>
            <Input
              id="lastName"
              type="text"
              placeholder="Coutreel"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="companyName"
              className="text-sm font-medium text-foreground"
            >
              Nom de l&apos;entreprise
            </label>
            <Input
              id="companyName"
              type="text"
              placeholder="Reelium"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Optionnel, mais pratique pour pré-remplir ton profil et ta
              future fiche entreprise.
            </p>
          </div>

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

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Mot de passe
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
              Minimum 8 caractères. Tu pourras le changer plus tard.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !email || !password}
          >
            {loading ? "Création..." : "Créer un compte"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Tu as déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium underline underline-offset-4"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
