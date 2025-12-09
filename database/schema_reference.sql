-- InvoiceFlow — Schéma de base de données (référence)
-- Copyright (c) 2025-2026 InvoiceFlow
-- Auteur : Antoine Coutreel <coutreelantoine@gmail.com>
-- Licence : MIT (SPDX-License-Identifier: MIT)
--
-- Mentions légales et responsabilité
-- Ce fichier contient le schéma SQL utilisé par InvoiceFlow. Il est fourni « tel quel »,
-- sans garantie d'aucune sorte, expresse ou implicite, y compris mais sans s'y limiter
-- les garanties de qualité marchande, d'adaptation à un usage particulier et d'absence
-- de contrefaçon. En aucun cas les auteurs ou titulaires de droits ne pourront être tenus
-- responsables de tout dommage direct, indirect, accessoire, spécial, exemplaire ou
-- consécutif résultant de l'utilisation de ce fichier.
--
-- Données personnelles et conformité
-- Le présent schéma définit des tables susceptibles de contenir des données personnelles.
-- Le responsable du traitement doit veiller à respecter la législation applicable (notamment
-- le RGPD pour les personnes concernées dans l'UE), à mettre en place les sécurités
-- appropriées et à informer les personnes concernées lorsqu'il y a lieu.
--
-- Droit applicable et contact
-- Ce fichier est soumis à la loi française. Pour toute question liée à ce schéma ou aux
-- mentions légales, contacter l'auteur à l'adresse ci-dessus.
--
-- Version du schéma : 2025.11.24
--
-- ⚠️ WARNING
-- Ce fichier est une photographie de schéma à but documentaire / de secours.
-- L'ordre des CREATE TABLE et la présence de schémas externes (ex. auth.users de Supabase)
-- peuvent nécessiter des ajustements avant exécution dans une base neuve.

-- Dépendances externes :
-- - Extension pgcrypto (pour gen_random_uuid())
-- - Schéma auth.users (créé par Supabase)
-- - Éventuelles politiques RLS définies dans des migrations séparées

-- =====================================================================
--  Types personnalisés
-- =====================================================================

-- Types de documents (factures, devis, etc.)
CREATE TYPE public.doc_kind AS ENUM (
  'invoice',
  'quote',
  'credit_note',
  'proforma'
);

-- Statuts des documents
CREATE TYPE public.doc_status AS ENUM (
  'draft',
  'sent',
  'accepted',
  'declined',
  'expired',
  'paid',
  'overdue',
  'void'
);

-- Types de lignes / articles
CREATE TYPE public.item_kind AS ENUM (
  'service',
  'product'
);

-- Méthodes de paiement
CREATE TYPE public.payment_method AS ENUM (
  'bank_transfer',
  'card',
  'cash',
  'check',
  'paypal',
  'other'
);

-- Types d'adresses (entreprises)
CREATE TYPE public.address_kind AS ENUM (
  'headquarters',
  'billing',
  'shipping',
  'other'
);

-- Types d'adresses (clients)
CREATE TYPE public.client_address_kind AS ENUM (
  'billing',
  'shipping',
  'other'
);

-- Rôles des membres d'une entreprise
CREATE TYPE public.membership_role AS ENUM (
  'owner',
  'admin',
  'member',
  'accountant'
);

-- Types de rappels de documents (email)
CREATE TYPE public.doc_reminders_kind AS ENUM (
  'before_due',
  'on_due',
  'after_due_1',
  'after_due_2',
  'custom'
);

-- Statuts des rappels de documents (email)
CREATE TYPE public.doc_reminders_status AS ENUM (
  'scheduled',
  'sent',
  'skipped',
  'failed'
);

CREATE TYPE public.email_log_status AS ENUM (
  'scheduled',
  'sent',
  'failed',
  'skipped'
);

-- =====================================================================
--  Tables "core" : devises, utilisateurs applicatifs
-- =====================================================================

-- Devises (EUR, USD, etc.)
CREATE TABLE public.currencies (
  code        text NOT NULL CHECK (char_length(code) = 3),
  name        text NOT NULL,
  symbol      text NOT NULL,
  locale      text,
  is_active   boolean DEFAULT true,
  created_at  timestamp with time zone DEFAULT now(),
  updated_at  timestamp with time zone DEFAULT now(),
  CONSTRAINT currencies_pkey PRIMARY KEY (code)
);

-- Taux de change par rapport à l'EUR
CREATE TABLE public.currency_rates (
  id            uuid NOT NULL DEFAULT gen_random_uuid(),
  currency_code text NOT NULL CHECK (
    currency_code = upper(btrim(currency_code))
    AND char_length(currency_code) = 3
  ),
  valid_from    date    NOT NULL,
  eur_per_unit  numeric NOT NULL CHECK (eur_per_unit > 0::numeric),
  CONSTRAINT currency_rates_pkey PRIMARY KEY (id),
  CONSTRAINT currency_rates_currency_code_fkey
    FOREIGN KEY (currency_code) REFERENCES public.currencies(code)
);

-- Utilisateurs applicatifs (profil), liés à auth.users
CREATE TABLE public.users (
  id          uuid NOT NULL,  -- = auth.users.id
  email       text,
  first_name  text,
  last_name   text,
  avatar_url  text,
  company_id  uuid,           -- éventuelle company "par défaut"
  role        text DEFAULT 'user'::text, -- rôle global (non multi-tenant)
  created_at  timestamp with time zone NOT NULL DEFAULT now(),
  updated_at  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  -- ALTER TABLE à la fin de ce fichier pour éviter les dépendances circulaires
  -- CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);

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
  user_id    uuid, -- créateur / responsable (optionnel, lié à public.users)
  name       text NOT NULL,
  email      text UNIQUE,
  address    text,
  company    text,
  phone      text,
  notes      text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
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
--  Documents (factures, devis, avoirs…) et lignes
-- =====================================================================

-- Documents commerciaux (factures, devis, etc.)
CREATE TABLE public.documents (
  id                     uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id                uuid,         -- créateur / auteur
  company_id             uuid NOT NULL,
  client_id              uuid NOT NULL,
  kind                   doc_kind NOT NULL,      -- invoice / quote / credit_note...
  status                 doc_status NOT NULL DEFAULT 'draft'::doc_status,
  number                 text,
  issue_date             date NOT NULL DEFAULT now(),
  due_date               date,
  currency_code          text NOT NULL DEFAULT 'EUR'::text,
  fx_eur_per_unit_snapshot numeric NOT NULL DEFAULT 1.000000
    CHECK (fx_eur_per_unit_snapshot > 0::numeric),
  subtotal               numeric NOT NULL DEFAULT 0,
  tax                    numeric NOT NULL DEFAULT 0,
  total                  numeric NOT NULL DEFAULT 0,
  total_eur              numeric,
  issue_year             integer DEFAULT EXTRACT(year FROM issue_date),
  sequence_number        integer,
  number_readonly        text,
  reference_document_id  uuid,
  supply_date            date,
  payment_terms          text,
  penalty_rate           numeric,
  recovery_fee           boolean,
  purchase_order_number  text,
  notes_public           text,
  notes_private          text,
  pdf_url                text,
  created_at             timestamp with time zone DEFAULT now(),
  updated_at             timestamp with time zone DEFAULT now(),
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT documents_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT documents_currency_code_fkey
    FOREIGN KEY (currency_code) REFERENCES public.currencies(code),
  CONSTRAINT documents_reference_document_id_fkey
    FOREIGN KEY (reference_document_id) REFERENCES public.documents(id),
  CONSTRAINT documents_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Lignes de documents
CREATE TABLE public.document_lines (
  id           uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id  uuid NOT NULL,
  kind         item_kind NOT NULL DEFAULT 'service'::item_kind,
  description  text NOT NULL,
  qty          numeric NOT NULL DEFAULT 1 CHECK (qty > 0::numeric),
  unit_price   numeric NOT NULL DEFAULT 0 CHECK (unit_price >= 0::numeric),
  unit         text,
  discount_rate   numeric,
  discount_amount numeric,
  tax_rate        numeric,
  line_total      numeric NOT NULL DEFAULT 0,
  position     integer,
  created_at   timestamp with time zone DEFAULT now(),
  updated_at   timestamp with time zone DEFAULT now(),
  CONSTRAINT document_lines_pkey PRIMARY KEY (id),
  CONSTRAINT document_lines_document_id_fkey
    FOREIGN KEY (document_id) REFERENCES public.documents(id)
);

-- Séquences de numérotation par entreprise, type de doc et année
CREATE TABLE public.document_sequences (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL,
  kind        doc_kind NOT NULL, -- type du document concerné
  year        integer NOT NULL,
  next_number integer NOT NULL DEFAULT 1,
  CONSTRAINT document_sequences_pkey PRIMARY KEY (id),
  CONSTRAINT document_sequences_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES public.companies(id)
);

-- Rappels (emails) planifiés pour les documents
CREATE TABLE public.document_reminders (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  kind        doc_reminders_kind NOT NULL, -- type de rappel
  scheduled_at timestamp with time zone NOT NULL,
  sent_at      timestamp with time zone,
  status      doc_reminders_status NOT NULL DEFAULT 'scheduled'::doc_reminders_status, -- statut du rappel
  created_at   timestamp with time zone DEFAULT now(),
  CONSTRAINT document_reminders_pkey PRIMARY KEY (id),
  CONSTRAINT document_reminders_document_id_fkey
    FOREIGN KEY (document_id) REFERENCES public.documents(id)
);

-- =====================================================================
--  Paiements
-- =====================================================================

-- Paiements enregistrés (encaissements)
CREATE TABLE public.payments (
  id           uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL, -- qui a enregistré le paiement
  company_id   uuid NOT NULL,
  method       payment_method NOT NULL,
  reference    text,
  paid_at      date NOT NULL DEFAULT now(),
  amount       numeric NOT NULL CHECK (amount > 0::numeric),
  currency_code text NOT NULL DEFAULT 'EUR'::text,
  notes        text,
  created_at   timestamp with time zone DEFAULT now(),
  updated_at   timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_currency_code_fkey
    FOREIGN KEY (currency_code) REFERENCES public.currencies(code),
  CONSTRAINT payments_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT payments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Répartition des paiements sur les documents
CREATE TABLE public.payment_allocations (
  payment_id  uuid NOT NULL,
  document_id uuid NOT NULL,
  amount      numeric NOT NULL CHECK (amount > 0::numeric),
  CONSTRAINT payment_allocations_pkey PRIMARY KEY (payment_id, document_id),
  CONSTRAINT payment_allocations_payment_id_fkey
    FOREIGN KEY (payment_id) REFERENCES public.payments(id),
  CONSTRAINT payment_allocations_document_id_fkey
    FOREIGN KEY (document_id) REFERENCES public.documents(id)
);

-- =====================================================================
--  Fichiers & liens
-- =====================================================================

-- Fichiers stockés (lien vers storage)
CREATE TABLE public.files (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL, -- propriétaire / uploader
  bucket      text NOT NULL,
  path        text NOT NULL,
  mime_type   text,
  size_bytes  integer,
  created_at  timestamp with time zone DEFAULT now(),
  CONSTRAINT files_pkey PRIMARY KEY (id),
  CONSTRAINT files_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Liens entre fichiers et entités métier (documents, etc.)
CREATE TABLE public.file_links (
  file_id      uuid NOT NULL,
  target_table text NOT NULL, -- ex: 'documents'
  target_id    uuid NOT NULL,
  created_at   timestamp with time zone DEFAULT now(),
  CONSTRAINT file_links_pkey PRIMARY KEY (file_id, target_table, target_id),
  CONSTRAINT file_links_file_id_fkey
    FOREIGN KEY (file_id) REFERENCES public.files(id)
);

-- =====================================================================
--  Logs d'emails & paramètres utilisateur
-- =====================================================================

-- Logs d'emails envoyés (notifications, envoi de factures, etc.)
CREATE TABLE public.email_logs (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id     uuid, -- qui a déclenché l'envoi
  to_email    text,
  subject     text,
  status      text, -- ex: 'sent', 'failed'
  created_at  timestamp with time zone DEFAULT now(),
  updated_at  timestamp with time zone DEFAULT now(),
  document_id uuid,
  CONSTRAINT email_logs_pkey PRIMARY KEY (id),
  CONSTRAINT email_logs_document_id_fkey
    FOREIGN KEY (document_id) REFERENCES public.documents(id),
  CONSTRAINT email_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Paramètres par utilisateur (signatures, mentions légales, etc.)
CREATE TABLE public.settings (
  user_id    uuid NOT NULL,
  logo_url   text,
  legal_notes text,
  bank_info  text,
  tax_rate   numeric NOT NULL DEFAULT 0.20,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT settings_pkey PRIMARY KEY (user_id),
  CONSTRAINT settings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- =====================================================================
--  Alters pour contraintes circulaires
-- =====================================================================

-- Ajout de la contrainte FK users.company_id → companies.id
ALTER TABLE public.users
  ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);
