-- =====================================================================
--  Entreprises & membres
-- =====================================================================

-- Entreprises (tenant logique)
CREATE TABLE public.companies (
  id                   uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL, -- créateur / propriétaire initial
  name                 text NOT NULL,
  legal_form           text,
  siren                text,
  siret                text,
  vat_number           text,
  rcs_city             text,
  ape_naf              text,
  share_capital        text,
  website              text,
  email                text,
  phone                text,
  logo_url             text,
  default_currency     text NOT NULL DEFAULT 'EUR'::text,
  payment_terms        text,
  penalty_rate         numeric,
  recovery_fee_enabled boolean DEFAULT true,
  vat_regime           text,
  legal_notes          text,
  created_at           timestamp with time zone DEFAULT now(),
  updated_at           timestamp with time zone DEFAULT now(),
  CONSTRAINT companies_pkey PRIMARY KEY (id),
  CONSTRAINT companies_default_currency_fkey
    FOREIGN KEY (default_currency) REFERENCES public.currencies(code),
  CONSTRAINT companies_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Adresses d'entreprise (siège, facturation, livraison…)
CREATE TABLE public.company_addresses (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL,
  kind        address_kind NOT NULL,  -- type d'adresse
  line1       text NOT NULL,
  line2       text,
  postal_code text,
  city        text,
  region      text,
  country     text NOT NULL DEFAULT 'FR'::text,
  created_at  timestamp with time zone DEFAULT now(),
  updated_at  timestamp with time zone DEFAULT now(),
  CONSTRAINT company_addresses_pkey PRIMARY KEY (id),
  CONSTRAINT company_addresses_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES public.companies(id)
);

-- Comptes bancaires d'entreprise
CREATE TABLE public.company_bank_accounts (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL,
  label       text NOT NULL,
  iban        text NOT NULL,
  bic         text,
  display     boolean DEFAULT true, -- affiché par défaut sur les docs ?
  created_at  timestamp with time zone DEFAULT now(),
  updated_at  timestamp with time zone DEFAULT now(),
  CONSTRAINT company_bank_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT company_bank_accounts_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES public.companies(id)
);

-- Membres des entreprises (multi-tenant, rôles par company)
CREATE TABLE public.company_memberships (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL,
  user_id     uuid NOT NULL,
  role        membership_role NOT NULL DEFAULT 'member'::membership_role,
  created_at  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT company_memberships_pkey PRIMARY KEY (id),
  CONSTRAINT company_memberships_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT company_memberships_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- =====================================================================
--  Clients & contacts
-- =====================================================================

-- Clients (tiers : personne / société cliente)
CREATE TABLE public.clients (
  id         uuid NOT NULL DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text UNIQUE,
  address    text,
  company    text,
  phone      text,
  notes      text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  company_id uuid, -- entreprise propriétaire du client
  membership_id uuid, -- user propriétaire du client
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT clients_membership_id_fkey
    FOREIGN KEY (membership_id) REFERENCES public.company_memberships(id),
);

-- Adresses clients (facturation / livraison)
CREATE TABLE public.client_addresses (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL,
  kind        client_address_kind NOT NULL, -- billing / shipping / other
  line1       text NOT NULL,
  line2       text,
  postal_code text,
  city        text,
  region      text,
  country     text NOT NULL DEFAULT 'FR'::text,
  created_at  timestamp with time zone DEFAULT now(),
  updated_at  timestamp with time zone DEFAULT now(),
  CONSTRAINT client_addresses_pkey PRIMARY KEY (id),
  CONSTRAINT client_addresses_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.clients(id)
);

-- Contacts rattachés au client
CREATE TABLE public.client_contacts (
  id         uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id  uuid NOT NULL,
  full_name  text NOT NULL,
  email      text,
  phone      text,
  role       text, -- ex: "Dirigeant", "Comptable"
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT client_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT client_contacts_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.clients(id)
);

-- =====================================================================
--  Alters pour contraintes circulaires
-- =====================================================================

-- Ajout de la contrainte FK users.company_id → companies.id
ALTER TABLE public.users
  ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);
