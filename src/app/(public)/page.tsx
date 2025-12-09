import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Barre de nav */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold">
              IF
            </div>
            <span className="text-sm font-semibold tracking-tight">
              InvoiceFlow
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-slate-50 transition">
              Fonctionnalités
            </a>
            <a href="#how-it-works" className="hover:text-slate-50 transition">
              Comment ça marche
            </a>
            <a href="#pricing" className="hover:text-slate-50 transition">
              Tarifs
            </a>
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="text-slate-300 hover:text-slate-50 transition"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-slate-950 shadow-sm hover:bg-emerald-400 transition"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <p className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Pensé pour les freelances & petites structures
              </p>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                Gérer tes clients & factures
                <span className="block text-emerald-400">
                  sans te perdre dans l’administratif.
                </span>
              </h1>

              <p className="text-sm text-slate-300 md:text-base max-w-xl">
                InvoiceFlow centralise clients, devis, factures et relances dans
                une interface claire. Tu passes moins de temps à subir ta
                paperasse, et plus de temps à faire ton vrai boulot.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition"
                >
                  Commencer gratuitement
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-slate-300 underline-offset-4 hover:text-slate-50 hover:underline"
                >
                  Déjà un compte ? Se connecter
                </Link>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Sans carte bancaire au départ
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Données hébergées en Europe
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-xl">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-100">
                    Vue d’ensemble
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                    Demo
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                    <p className="text-[10px] text-slate-400">
                      CA du mois (HT)
                    </p>
                    <p className="mt-1 text-sm font-semibold">3 250 €</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                    <p className="text-[10px] text-slate-400">
                      Factures en attente
                    </p>
                    <p className="mt-1 text-sm font-semibold">4</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                    <p className="text-[10px] text-slate-400">
                      Délai moyen de paiement
                    </p>
                    <p className="mt-1 text-sm font-semibold">21 j</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400">
                    Dernières factures
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2">
                      <div>
                        <p className="text-xs font-medium">FAC-2025-001</p>
                        <p className="text-[10px] text-slate-400">
                          Client Demo · 1 200 €
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
                        Payée
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2">
                      <div>
                        <p className="text-xs font-medium">DEV-2025-014</p>
                        <p className="text-[10px] text-slate-400">
                          Mission en cours · 850 €
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">
                        En attente
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <span className="text-[10px] text-slate-500">
                    Interface en cours de construction
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-b border-slate-800 bg-slate-950"
        >
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                Tout ce qu’il faut pour piloter ton activité calmement.
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Tu n’as pas besoin d’un ERP. Tu as besoin d’un outil simple,
                fiable, qui t’aide à suivre l’essentiel sans te prendre la tête.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <h3 className="text-sm font-semibold">Clients & contacts</h3>
                <p className="mt-2 text-xs text-slate-300">
                  Tous tes clients, adresses et contacts au même endroit. Fini
                  les infos perdues dans des fichiers Excel ou des mails.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <h3 className="text-sm font-semibold">Devis, factures, avoirs</h3>
                <p className="mt-2 text-xs text-slate-300">
                  Création rapide de devis & factures, numérotation propre, PDF
                  prêts à être envoyés. Tu restes carré sans t’arracher les
                  cheveux.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <h3 className="text-sm font-semibold">
                  Suivi des paiements simple
                </h3>
                <p className="mt-2 text-xs text-slate-300">
                  Qui t’a payé, qui est en retard, combien tu dois encaisser
                  ce mois-ci. Tu vois où tu en es, noir sur blanc.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="border-b border-slate-800 bg-slate-950"
        >
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Comment ça se passe concrètement ?
            </h2>

            <div className="mt-6 grid gap-4 text-sm md:grid-cols-3">
              <div className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 text-[11px]">
                  1
                </span>
                <div>
                  <p className="font-medium">Tu crées ton compte</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Quelques infos de base, ta structure, et tu peux déjà créer
                    tes premiers clients.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 text-[11px]">
                  2
                </span>
                <div>
                  <p className="font-medium">Tu émets ton premier devis</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Tu définis ton client, tes prestations, tes prix. Le PDF est
                    généré automatiquement.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 text-[11px]">
                  3
                </span>
                <div>
                  <p className="font-medium">
                    Tu suis tes paiements sereinement
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    Tu vois ce qui est payé, en retard, à relancer. Tu gardes le
                    contrôle sans y passer tes soirées.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing (placeholder) */}
        <section id="pricing" className="bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Tarifs simples, sans surprise.
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              Les formules détaillées arrivent bientôt. D’ici là, tu peux déjà
              créer un compte et tester les bases gratuitement.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 max-w-md">
              <p className="text-sm font-semibold">Offre de lancement</p>
              <p className="mt-1 text-xs text-slate-300">
                Accès anticipé à InvoiceFlow avec les fonctionnalités cœur :
                clients, devis, factures.
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight">
                Bientôt dispo
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Tu pourras commencer gratuitement, puis choisir une formule si
                l’outil te fait gagner du temps.
              </p>

              <div className="mt-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
                >
                  Être prévenu du lancement
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} InvoiceFlow. Tous droits réservés.</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/legal" className="hover:text-slate-200 transition">
              Mentions légales
            </Link>
            <Link href="/privacy" className="hover:text-slate-200 transition">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
