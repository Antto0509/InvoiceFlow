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
