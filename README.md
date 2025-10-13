# 💼 InvoiceFlow

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3FCF8E?logo=supabase)](https://supabase.com/)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy%20on-Vercel-black?logo=vercel)](https://vercel.com/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?logo=stripe)](https://stripe.com/)
[![Status](https://img.shields.io/badge/Status-🚧%20In%20Development-yellow)]()

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
|--------------|------|
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
├── app/                # Pages Next.js (App Router)
├── components/         # UI Components (formulaires, boutons, tables)
├── lib/                # Fonctions utilitaires (Supabase, Stripe, mail)
├── public/             # Logos, images
├── styles/             # Fichiers Tailwind et CSS globaux
├── .env.local          # Variables d'environnement
└── README.md
```

---

## 🧮 Variables d’environnement (.env.local)

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
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
📅 **Lancement prévu :** décembre 2025  
🚀 **Objectif :** premier SaaS rentable & automatisé pour freelances  

🧠 *Prochaines étapes :*
- Finaliser le système de factures PDF  
- Lancer la bêta test  
- Intégrer la facturation Stripe  

---

> _« Build slow, build right, then let your code earn while you sleep. »_  
> — Antoine ⚡️
