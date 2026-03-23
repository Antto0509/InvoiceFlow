# Architecture — InvoiceFlow

## 1. Vue d'ensemble

InvoiceFlow est un SaaS de facturation multi-tenant construit sur :

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Base de données | Supabase (PostgreSQL + PostgREST + Auth) |
| UI | shadcn/ui + Tailwind CSS |
| Validation | Zod |
| Formulaires | React Hook Form |
| Email | Brevo (API HTTP) |
| Tests | Vitest + Testing Library |

Le modèle multi-tenant est basé sur la notion de **company** : un utilisateur appartient à une ou plusieurs companies, et chaque donnée (clients, documents, paiements…) est scoped à une `company_id`, appliqué à deux niveaux indépendants :
- **PostgreSQL** : Row-Level Security (`database/09_rls.sql`)
- **Applicatif** : `defaultFilters: { company_id }` dans chaque API class

---

## 2. Structure des dossiers

```
InvoiceFlow/
├── src/
│   ├── app/                    # Routes Next.js (App Router)
│   ├── components/             # Composants UI partagés
│   ├── data/                   # Couche données (APIs, repositories, Supabase)
│   ├── features/               # Modules métier (clients, documents, companies…)
│   ├── hooks/                  # Hooks React partagés
│   ├── lib/                    # Utilitaires, constantes, types
│   ├── schemas/                # Schémas Zod globaux partagés
│   └── middleware.ts           # Guard d'authentification (routes privées)
├── database/                   # Migrations SQL (PostgreSQL)
├── tests/                      # Tests unitaires et intégration
└── docs/                       # Documentation
```

### `src/app/` — Routage

```
app/
├── (private)/dashboard/        # Routes protégées (auth requise)
│   ├── page.tsx                # Dashboard principal
│   ├── clients/                # Gestion des clients (+ addresses, contacts, tags)
│   ├── companies/              # Gestion de l'entreprise (+ adresses, banque, taxes)
│   ├── documents/              # Factures, devis, avoirs, proformas, abonnements
│   ├── items/                  # Articles (+ catégories, grilles tarifaires)
│   └── settings/               # Paramètres généraux, intégrations, paiements, reminders
├── (public)/                   # Routes sans authentification
│   ├── page.tsx                # Landing page
│   ├── login/ register/        # Authentification
│   └── legal/                  # Mentions légales, politique de confidentialité
└── api/
    ├── auth/callback/          # Callback OAuth Supabase
    └── documents/[id]/
        ├── pdf/                # Génération PDF (rate-limited : 30 req/5min)
        ├── email-preview/      # Aperçu email (rate-limited : 60 req/min)
        └── send-email/         # Envoi email (rate-limited : 10 req/h)
```

> Les routes `(private)` sont protégées par `src/middleware.ts` qui vérifie `supabase.auth.getUser()` à chaque requête.

---

## 3. Flux de données : Page → Supabase

```
Page component (app/.../page.tsx)
    │
    ▼
useDataTable(fetcher, initialParams)       ← src/hooks/useDataTable.ts
    │  Gère : état de chargement, pagination, race conditions, refresh()
    │
    ▼
Repository function                        ← src/features/<domain>/data/*.repository.ts
    │  Ex: listClients(params, companyId)
    │  Applique les filtres métier spécifiques au domaine
    │
    ▼
Domain API class                           ← src/data/class/<domain>/*Api.ts
    │  Ex: ClientsApi extends ResourceApi
    │  Configure : table, select, sortableColumns, defaultFilters
    │
    ▼
ResourceApi<T>                             ← src/data/class/ResourceApi.ts
    │  Construit la requête PostgREST : pagination, filtres, tri, search
    │  Strip les colonnes protégées sur les writes
    │  Logge les mutations si withLogging=true
    │
    ▼
Supabase client                            ← src/data/supabase/client.ts (browser)
    │                                         src/data/supabase/server.ts (API routes / RSC)
    ▼
PostgreSQL via PostgREST (Supabase)
```

**Exemple concret — afficher la liste des clients :**

```ts
// 1. Page
const { data, loading } = useDataTable(
  (p) => listClients(p, companyId),
  { page: 1, pageSize: 20 }
);

// 2. Repository
export async function listClients(params, companyId?) {
  const api = new ClientsApi(companyId);
  const { data, total } = await api.list({ page: params.page, search: params.search });
  return { rows: data, total };
}

// 3. ClientsApi
class ClientsApi extends ResourceApi<Client> {
  constructor(companyId?: string) {
    super({
      table: "clients",
      select: "id, name, email, phone, created_at",
      defaultFilters: companyId ? { company_id: { op: "eq", value: companyId } } : undefined,
      sortableColumns: ["name", "email", "created_at"],
    });
  }
}

// 4. ResourceApi.list() construit :
// supabase.from("clients").select("...").eq("company_id", companyId).range(0, 19)
```

---

## 4. Couche données (`src/data/`)

### `ResourceApi<T>` — Base CRUD générique

Fichier : `src/data/class/ResourceApi.ts`

Toutes les classes d'API de domaine héritent de cette classe. Elle encapsule PostgREST et fournit :

**Constructeur (`ResourceApiOptions`) :**

| Option | Type | Description |
|---|---|---|
| `table` | `string` | Nom de la table/vue Supabase |
| `select` | `string` | Colonnes explicites (jamais `*`) |
| `sortableColumns` | `string[]` | Whitelist anti-injection pour le tri |
| `searchColumns` | `string[]` | Colonnes pour le ILIKE multi-colonnes |
| `defaultFilters` | `Record<string, FilterOps>` | Filtres appliqués à toutes les requêtes (ex: `company_id`) |
| `primaryKey` | `string \| string[]` | Clé primaire simple ou composite |
| `protectedColumns` | `string[]` | Colonnes strippées avant write |
| `withLogging` | `boolean` | Active le log automatique des mutations |
| `mapRow` | `(row) => T` | Transformation optionnelle des rows |

**Méthodes publiques :**

| Méthode | Description |
|---|---|
| `list(q)` | Liste paginée avec filtres, recherche et tri |
| `listAll(limit, q)` | Tous les enregistrements jusqu'à `limit` (retourne `{ data, truncated }`) |
| `get(key)` | Récupère un enregistrement par PK |
| `create(payload)` | Insère un enregistrement |
| `update(key, payload)` | Met à jour un enregistrement |
| `upsertMany(payloads)` | Upsert batch (1 seule requête) |
| `remove(key)` | Supprime un enregistrement |
| `bulkDelete(keys)` | Supprime N enregistrements en 1 requête |
| `exists(filters)` | Vérifie l'existence sans fetcher les données |
| `count(q)` | Compte les enregistrements |

### Pattern API de domaine

```ts
// src/data/class/clients/ClientsApi.ts
export class ClientsApi extends ResourceApi<Client> {
  constructor(companyId?: string, supabaseClient?: SupabaseClient) {
    super({
      table: "clients",
      select: "id, company_id, name, email, phone, notes, created_at, updated_at",
      sortableColumns: ["name", "email", "created_at"],
      searchColumns: ["name", "email", "phone"],
      defaultFilters: companyId ? { company_id: { op: "eq", value: companyId } } : undefined,
      protectedColumns: ["created_at", "updated_at"],
    }, supabaseClient);
  }
}
```

> **Règle** : le `select` doit toujours lister les colonnes explicitement. Jamais `"*"`.

### Pattern Aggregate

Pour les opérations sur plusieurs tables liées, les classes `*Aggregate` orchestrent les fetches en parallèle :

```ts
// src/data/class/clients/ClientsAggregate.ts
export class ClientsAggregate {
  async getWithDetails(clientId: string, companyId: string) {
    const [client, { data: addresses }, { data: contacts }] = await Promise.all([
      clientsApi.get(clientId),
      addressesApi.list({ filters: { client_id: { op: "eq", value: clientId } } }),
      contactsApi.list({ filters: { client_id: { op: "eq", value: clientId } } }),
    ]);
    return { ...client, addresses, contacts };
  }

  async create(payload, addresses, contacts) {
    const client = await clientsApi.create(payload);
    // Batch insert en 1 requête (pas de boucle séquentielle)
    await addressesApi.upsertMany(addresses.map(a => ({ ...a, client_id: client.id })));
    await contactsApi.upsertMany(contacts.map(c => ({ ...c, client_id: client.id })));
    return client;
  }
}
```

### Pattern Repository

Les repositories wrappent les API classes avec la logique métier :

```ts
// src/features/clients/data/clients.repository.ts
export const makeClientsApi = (companyId?: string) =>
  new ClientsApi(companyId);

export async function listClients(params: ClientListParams, companyId?: string) {
  const api = makeClientsApi(companyId);
  try {
    const { data, total } = await api.list({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sort: params.sort,
      filters: {
        ...(params.hasEmail ? { email: { op: "neq", value: null } } : {}),
      },
    });
    return { rows: data, total };
  } catch (err) {
    if (isDev) console.error("[clients] listClients failed", err);
    throw err;
  }
}
```

### Clients Supabase — deux clients distincts

| Fichier | Contexte | Mécanisme |
|---|---|---|
| `supabase/client.ts` | Client components, hooks | Singleton browser (`createBrowserClient`) |
| `supabase/server.ts` | API routes, Server Components | Usine par requête avec `cookies()` (`createServerClient`) |
| `supabase/middleware.ts` | `middleware.ts` | Client sans cookies (lecture seule de la session) |

> **Important** : `ResourceApi` importe uniquement depuis `supabase/client.ts` (pas le barrel `index.ts`) pour éviter de bundler `next/headers` dans les Client Components.

---

## 5. Feature modules (`src/features/`)

Chaque domaine métier est encapsulé dans un module autonome :

```
features/<domain>/
├── components/
│   ├── dialogs/        # CreateDialog, EditDialog, DeleteDialog
│   ├── forms/          # Formulaires (Zod + React Hook Form)
│   └── tables/         # Tables de liste (colonnes, tri, bulk actions)
├── data/
│   └── *.repository.ts # Fonctions wrappant les API classes
├── hooks/
│   └── use*.ts         # Hooks de domaine (ex: useClientsTable)
├── schemas/
│   └── *.schema.ts     # Schémas Zod + types TypeScript inférés
└── index.ts            # Exports publics du module
```

**Modules existants :**

| Module | Responsabilité |
|---|---|
| `clients` | Clients, adresses client, contacts client |
| `companies` | Entreprise utilisateur, bank accounts, memberships |
| `documents` | Factures, devis, avoirs, proformas + lignes de document |
| `emails` | Templates email (HTML + texte), prévisualisation |
| `activityLogs` | Journal d'activité (audit trail) |

> **Règle** : pas d'import circulaire entre features. Un feature peut importer depuis `src/data/` et `src/components/` mais pas depuis un autre feature.

---

## 6. Schémas Zod

Deux emplacements selon la portée :

| Emplacement | Contenu |
|---|---|
| `src/schemas/` | Schémas partagés entre plusieurs features (currencies, payments, email_logs, files, settings, users) |
| `src/features/<domain>/schemas/` | Schémas propres à un domaine (clients, companies, documents, logs) |

**Convention dans chaque fichier :**

```ts
// Schéma DB strict (correspond exactement à la table)
export const clientSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  name: z.string(),
  // ...
});

// Schéma form permissif (champs optionnels, transformations)
export const clientFormSchema = clientSchema.omit({ id: true, company_id: true }).partial();

// Types TypeScript inférés (source unique de vérité)
export type Client = z.infer<typeof clientSchema>;
export type ClientForm = z.infer<typeof clientFormSchema>;
```

---

## 7. Multi-tenancy

L'isolation des données par company est assurée à **deux niveaux indépendants** :

### Niveau base de données — RLS PostgreSQL

`database/09_rls.sql` définit des policies sur chaque table :

```sql
-- Exemple sur la table clients
CREATE POLICY "clients_select" ON public.clients
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_memberships WHERE user_id = auth.uid()
    )
  );
```

Toutes les tables métier ont des policies `SELECT / INSERT / UPDATE / DELETE`. Les tables intermédiaires (ex: `document_lines`) héritent de l'isolation via JOIN chain.

### Niveau applicatif — `defaultFilters`

Chaque API class reçoit un `companyId` et l'applique via `defaultFilters` :

```ts
new ResourceApi({ defaultFilters: { company_id: { op: "eq", value: companyId } } })
```

Ce filtre est ajouté automatiquement à **toutes** les requêtes (list, get, update, delete) — impossible d'oublier de le passer.

---

## 8. Base de données (`database/`)

Fichiers SQL dans l'ordre d'exécution :

| Fichier | Rôle |
|---|---|
| `00_types.sql` | Types enum PostgreSQL (`doc_kind`, `doc_status`, `log_nature`, etc.) |
| `01_tables_core.sql` | Tables de base : `currencies`, `currency_rates` |
| `02_tables_business.sql` | Tables métier : `companies`, `company_memberships`, `company_addresses`, `company_bank_accounts`, `clients`, `client_addresses`, `client_contacts` |
| `03_tables_documents.sql` | `documents`, `document_lines`, `document_numbering_configs`, `document_reminders`, `document_sequences` |
| `04_tables_payments.sql` | `payments`, `payment_allocations` |
| `05_tables_files_email_logs_settings.sql` | `files`, `file_links`, `email_logs`, `settings` |
| `06_views.sql` | Vues SQL : `documents_with_client` (jointure document + client pour les listes), `logs_with_user_company` |
| `07_functions.sql` | Fonctions PostgreSQL : `generate_document_number()`, `replace_document_lines()`, triggers de calcul des totaux |
| `08_triggers.sql` | Triggers : timestamps `updated_at`, cascades de suppression, validation d'appartenance avant INSERT |
| `09_rls.sql` | Row-Level Security : policies d'accès sur toutes les tables |
| `10_seeds.sql` | Données initiales (devises, paramètres par défaut) |
| `schema_reference.sql` | Documentation du schéma complet |

**Fonctions notables (`07_functions.sql`) :**

- `generate_document_number(company_id, kind, year)` — génère atomiquement un numéro de document (incrémente la séquence, pas de race condition)
- `replace_document_lines(document_id, lines jsonb)` — remplace toutes les lignes d'un document en une transaction (DELETE orphelins + upsert entrants)

---

## 9. Tests (`tests/`)

```
tests/
├── api/                        # Routes API
│   ├── auth-callback.test.ts
│   ├── documents-pdf.test.ts
│   └── waitlist.test.ts
├── components/                 # Composants UI
│   ├── datatable/
│   └── forms/
├── unit/
│   ├── class/                  # Tests des API classes
│   │   ├── clients/
│   │   ├── companies/
│   │   ├── currencies/
│   │   ├── documents/
│   │   └── files/
│   ├── data/
│   │   ├── repositories/       # Tests des repositories
│   │   └── createResourceApi.test.ts
│   └── lib/                    # Tests des utilitaires
└── mocks/
    ├── supabaseMock.ts         # Mock Supabase complet (vi.fn() chaînable)
    ├── server-only.ts
    └── setup.ts
```

**Conventions :**
- **Framework** : Vitest + Testing Library (jsdom)
- **Mocks** : `supabaseMock` remplace le vrai client Supabase — ne jamais utiliser le vrai client dans les tests unitaires
- **Isolation** : chaque test réinitialise les mocks via `beforeEach(() => vi.clearAllMocks())`
- **Globals** : `describe`, `it`, `expect`, `vi` disponibles sans import (configuré dans `vitest.config.ts`)

---

## 10. Conventions du projet

### Langue
- Strings UI en **français** (`DEFAULT_LANGUAGE = "fr"` dans `src/lib/constants.ts`)
- Code et commentaires techniques en français ou anglais (les deux coexistent)

### Format des erreurs API
```ts
{ ok: false, error: { code: string, message: string, traceId: string } }
```

### Commits
Préfixes emoji (voir `CONTRIBUTING.md`) :
- `✨ feat` — nouvelle fonctionnalité
- `🐛 fix` — correction de bug
- `♻️ refactor` — refactoring
- `✅ test` — tests
- `📝 docs` — documentation

### Routing
- `(private)` — routes nécessitant une session Supabase active
- `(public)` — routes accessibles sans authentification

### Logging console
- `console.log` interdit en production (règle ESLint `no-console`)
- Utiliser `if (isDev) console.error(...)` pour les logs de debug
- Exception : fichiers utilitaires de développement (debug.ts, reset.ts) avec `/* eslint-disable no-console */`

### Rate limiting
Implémenté dans `src/lib/rateLimit.ts` (sliding window en mémoire) :
- PDF : 30 req / 5 min
- Email preview : 60 req / min
- Send email : 10 req / h
