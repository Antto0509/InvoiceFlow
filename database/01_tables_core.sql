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
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
