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
