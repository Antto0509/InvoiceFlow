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
├── public/             # Fichiers statiques (images, favicon)
├── src/
│   ├── app/               # Pages Next.js (App Router)
│   ├── components/        # UI Components (formulaires, boutons, tables)
│   ├── lib/               # Fonctions utilitaires (Supabase, Stripe, mail)
│   └── middleware.ts      # Middleware (auth, logging)
├── .env.local          # Variables d'environnement
├── package.json        # Dépendances & scripts npm
├── tailwind.config.js  # Configuration TailwindCSS
├── tsconfig.json       # Configuration TypeScript
├── CONTRIBUTING.md     # Guide de contribution
├── LICENSE             # Licence MIT
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

## 🤝 Contribuer

Les contributions sont les bienvenues !  
Si tu veux aider à améliorer **InvoiceFlow**, voici comment faire 👇

### 🧭 Processus de contribution

1. **Fork** le repo  
2. **Crée une branche** pour ta feature ou ton correctif :  
   ```bash
   git checkout -b feature/ma-super-feature
   ```
3. **Commit** tes modifications avec un message clair :
   ```bash
   git commit -m "✨ Ajout de la génération automatique de PDF"
   ```
4. **Push** la branche :
   ```bash
   git push origin feature/ma-super-feature
   ```
5. **Ouvre une Pull Request** sur la branche `main`  
➡️ Merci d’expliquer clairement ce que ta PR apporte ou corrige.

---

## 📋 Règles de style

- Code propre, clair et commenté.
- Utilise TypeScript si possible.
- Respecte la structure du projet existante.
- Évite les dépendances inutiles.
- Les commits doivent suivre une syntaxe simple :
  - ✨ feature: ajout de ...
  - 🐛 fix: correction de ...
  - 🧹 refactor: nettoyage / simplification
  - 📚 docs: mise à jour de la documentation

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
 - Génération PDF
 - Envoi d’emails
 - Relances automatiques
 - Stripe Billing
 - Déploiement Vercel
 - Lancement public 🚀

---

> _« Build slow, build right, then let your code earn while you sleep. »_  
> — Antoine ⚡️
