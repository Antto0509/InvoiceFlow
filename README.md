# 💼 InvoiceFlow

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3FCF8E?logo=supabase)](https://supabase.com/)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy%20on-Vercel-black?logo=vercel)](https://vercel.com/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?logo=stripe)](https://stripe.com/)
[![Status](https://img.shields.io/badge/Status-🚧%20In%20Development-yellow)](https://github.com/Antto05/InvoiceFlow/issues)

---

> **InvoiceFlow** est un SaaS moderne de facturation conçu pour les **freelances** et **indépendants**.  
> Crée, envoie et suis tes devis et factures en quelques clics. Génération PDF, envoi par mail, relances automatiques et interface fluide — tout pour gérer ton activité sans prise de tête.

---

## 🚀 Fonctionnalités principales

- 🧾 Création de devis et factures personnalisées  
- 📤 Envoi automatique par email  
- 📅 Relances automatiques pour factures impayées  
- 💰 Suivi des revenus mensuels et des paiements  
- 📄 Génération de PDF professionnels  
- 💳 Abonnements via Stripe (freemium, pro, expert)  
- 🔐 Authentification sécurisée via Supabase  
- 🌗 UI responsive et claire avec TailwindCSS  

---

## 🧱 Stack technique

| Technologie | Rôle |
| ------------ | ------ |
| [Next.js](https://nextjs.org/) | Framework React full-stack |
| [TailwindCSS](https://tailwindcss.com/) | Design system moderne |
| [Supabase](https://supabase.com/) | Base de données, Auth & Storage |
| [Stripe](https://stripe.com/) | Paiements et abonnements |
| [Resend](https://resend.com/) | Envoi d’emails transactionnels |
| [Vercel](https://vercel.com/) | Hébergement & déploiement |
| [react-pdf](https://react-pdf.org/) | Génération des factures PDF |

---

## ⚙️ Installation locale

```bash
# 1️⃣ Clone le repo
git clone https://github.com/tonpseudo/InvoiceFlow.git
cd InvoiceFlow

# 2️⃣ Installe les dépendances
npm install

# 3️⃣ Configure les variables d'environnement
cp .env.example .env.local
# (Ajoute tes clés Supabase, Stripe, Resend, etc.)

# 4️⃣ Lance le serveur de dev
npm run dev

# 🚀 L’app tourne sur http://localhost:3000
```

---

## 📁 Structure du projet

```text
InvoiceFlow/
├── .github/            # Workflows GitHub Actions
├── database/           # Scripts de migration & seed Supabase
├── public/             # Fichiers statiques (images, favicon)
├── scripts/            # Scripts utilitaires (import CSV, etc.)
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── (private)/             # Pages privées (auth requise)
│   │   ├── (public)/              # Pages publiques (landing, login, signup)
│   │   ├── api/                   # Routes API (webhooks, etc.)
│   │   ├── globals.css            # Styles globaux
│   │   └── layout.tsx             # Layout global
│   ├── components/             # UI Components (formulaires, boutons, tables)
│   │   ├── auth/                   # Composants liés à l’authentification
│   │   ├── datatable/              # Composants de tableau de données
│   │   ├── forms/                  # Composants de formulaires
│   │   ├── landing/                # Composants de la page d’accueil
│   │   ├── layout/                 # Composants de layout (navbar, sidebar)
│   │   ├── ui/                     # Composants UI génériques shadcn (buttons, modals, etc.)
│   │   ├── EmptySkeleton.tsx        # Composant de chargement vide
│   │   ├── EmptyState.tsx           # Composant d’état vide
│   │   ├── ListPage.tsx             # Composant de page liste générique
│   │   ├── ThemeProvider.tsx         # Composant de gestion du thème
│   │   ├── ThemeToggle.tsx           # Composant de bascule thème clair/sombre
│   │   └── ThemeWipeProvider.tsx     # Composant de gestion du thème avec wipe
│   ├── data/                   # Accès aux données (Supabase queries)
│   ├── features/               # Fonctionnalités (factures, clients, etc.)
│   ├── hooks/                  # Hooks React personnalisés
│   ├── lib/                    # Fonctions utilitaires (Supabase, Stripe, mail)
│   ├── schemas/                # Schémas de validation (Zod)
│   └── middleware.ts           # Middleware (auth, logging)
├── tests/                  # Tests unitaires & d’intégration
│   ├── components/             # Tests des composants UI
│   ├── mocks/                  # Données mock pour les tests
│   ├── unit/                   # Tests des fonctions utilitaires
│   │   ├── data/                   # Tests des accès aux données
│   │   └── lib/                    # Tests des fonctions
│   └── setup.ts                # Configuration globale des tests
├── .env.example            # Exemple de variables d'environnement -> .env.local
├── .gitignore              # Fichiers à ignorer par Git
├── components.json         # Configuration Storybook
├── eslint.config.js        # Configuration ESLint
├── next.config.js          # Configuration Next.js
├── package.json            # Dépendances & scripts npm
├── tailwind.config.js      # Configuration TailwindCSS
├── tsconfig.json           # Configuration TypeScript
├── tsconfig.vitest.json    # Configuration TypeScript pour Vitest
├── vitest.config.ts        # Configuration Vitest
├── CONTRIBUTING.md         # Guide de contribution
├── LICENSE                 # Licence MIT
└── README.md
```

---

## 🧮 Variables d’environnement (.env.local)

```text
# ---------------
# Next.js
# ---------------

NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ---------------
# Supabase
# ---------------

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# ---------------
# Stripe
# ---------------

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# ---------------
# Brevo
# ---------------

BREVO_API_KEY=
BREVO_WAITLIST_ID=
BREVO_WEBHOOK_TRANS_TOKEN=
BREVO_WEBHOOK_MARKET_TOKEN=
```

---

## 🧪 Lancement en mode dev

```bash
npm run dev
```

🧠 L’application sera accessible sur `http://localhost:3000`.  
🔄 Toute modification est rechargée automatiquement.

---

## 🪙 Licence

Ce projet est distribué sous la licence **MIT**.

Tu es libre de :

- ✅ utiliser le code dans tes projets personnels ou commerciaux ;
- ✏️ le modifier et l’adapter à tes besoins ;
- 🚀 le redistribuer librement, tant que la mention de copyright est conservée.

📄 [Voir le fichier LICENSE](LICENSE)

---

## 👤 Auteur

**Antoine**  
💻 Développeur web — passionné par les outils utiles et élégants.  
📅 Bâtit InvoiceFlow depuis octobre 2025.  
📫 Contact : [coutreelantoine@gmail.com](mailto:coutreelantoine@gmail.com)  
📢 Linkedin : [Antoine Coutreel](https://www.linkedin.com/in/antoine-coutreel/)  
🌐 Site perso : [antoine-coutreel.fr](https://antoine-coutreel.fr)

---

## 💬 Statut du projet

🧱 **Phase actuelle :** développement du MVP  
📅 **Lancement prévu :** septembre 2026  
🚀 **Objectif :** premier SaaS rentable & automatisé pour freelances  

🧠 *Prochaines étapes :*

- Finaliser le système de factures  
- Lancer la bêta test  
- Intégrer la facturation Stripe  

---

## 🤝 Contribuer

Les contributions sont les bienvenues !  
Si tu veux aider à améliorer **InvoiceFlow**, voici comment faire 👇

### 🧭 Processus de contribution & 📋 Règles de style

🤝 [Voir le fichier CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🧪 Tests & QA

- Vérifie que le build passe avant toute PR (`npm run build`).
- Teste les fonctionnalités principales manuellement.
- Si tu ajoutes des tests unitaires, place-les dans `/tests`.

---

## 🗨️ Discussion & Feedback

Tu peux :

- Ouvrir une issue pour signaler un bug ou proposer une idée 💡
- Discuter sur les Discussions GitHub (si activées)
- Ou me contacter directement sur [LinkedIn](https://www.linkedin.com/in/antoine-coutreel/)  

---

> Chaque contribution, même minime, rend InvoiceFlow plus utile aux freelances. 💪

---

## 🧭 Roadmap publique

- Authentification Supabase
- CRUD Clients / Factures
- Génération PDF + facturation électronique (Factur-X, UBL et/ou CII)
- Envoi d’emails
- Relances automatiques
- Stripe Billing
- Déploiement Vercel
- Lancement public 🚀

---

> *« Build slow, build right, then let your code earn while you sleep. »*  
> — Antoine ⚡️
