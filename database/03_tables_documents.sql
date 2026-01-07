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
