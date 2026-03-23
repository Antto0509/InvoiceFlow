-- =====================================================================
-- InvoiceFlow — Functions (public)
-- =====================================================================
-- Fonctions utilitaires, métiers et triggers pour le schéma InvoiceFlow.
-- Les triggers sont définis dans triggers.sql.
-- =====================================================================

-- =========================================================
-- 1. Fonctions utilitaires génériques
-- =========================================================

-- Met à jour updated_at si la colonne existe
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF to_jsonb(NEW) ? 'updated_at' THEN
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$function$;

-- Remplit NEW.user_id avec auth.uid() si présent et manquant,
-- et s'assure que public.users contient bien ce user.
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF to_jsonb(NEW) ? 'user_id' THEN
    IF NEW.user_id IS NULL THEN
      NEW.user_id := auth.uid();
    END IF;

    -- Garantir l'existence du user applicatif
    IF NOT EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = NEW.user_id
    ) THEN
      INSERT INTO public.users (id)
      VALUES (NEW.user_id)
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- =========================================================
-- 2. Fonctions users / onboarding (sync avec auth.users)
-- =========================================================

-- À brancher sur auth.users (AFTER INSERT) pour créer le profil + éventuelle company
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  v_company_id  uuid;
  v_company_name text;
BEGIN
  v_company_name := nullif(NEW.raw_user_meta_data ->> 'company_name', '');

  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    avatar_url,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    coalesce(NEW.raw_user_meta_data ->> 'role', 'user'),
    coalesce(NEW.created_at, now()),
    coalesce(NEW.created_at, now())
  )
  ON CONFLICT (id) DO NOTHING;

  -- Création d'une entreprise par défaut si un nom est fourni
  IF v_company_name IS NOT NULL THEN
    INSERT INTO public.companies (user_id, name)
    VALUES (NEW.id, v_company_name)
    RETURNING id INTO v_company_id;

    -- Membership owner
    INSERT INTO public.company_memberships (company_id, user_id, role)
    VALUES (v_company_id, NEW.id, 'owner');
  END IF;

  RETURN NEW;
END;
$function$;

-- À brancher sur auth.users (AFTER UPDATE) pour sync le profil
CREATE OR REPLACE FUNCTION public.handle_updated_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
BEGIN
  INSERT INTO public.users AS u (
    id,
    email,
    first_name,
    last_name,
    avatar_url,
    company_id,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    nullif(NEW.raw_user_meta_data ->> 'company_id', '')::uuid,
    coalesce(NEW.raw_user_meta_data ->> 'role', 'user'),
    coalesce(NEW.created_at, now()),
    now()
  )
  ON CONFLICT (id) DO UPDATE
    SET email      = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name  = EXCLUDED.last_name,
        avatar_url = EXCLUDED.avatar_url,
        company_id = EXCLUDED.company_id,
        role       = EXCLUDED.role,
        updated_at = now();

  RETURN NEW;
END;
$function$;

-- =========================================================
-- 3. FX / Devises
-- =========================================================

-- Récupère les taux depuis Frankfurter et met à jour currencies + currency_rates
-- ⚠ nécessite http_get() (extension http ou fonction Supabase équivalente)
CREATE OR REPLACE FUNCTION public.fx_upsert_from_frankfurter()
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  v_status int;
  v_body   jsonb;
  v_date   date;
BEGIN
  -- 1) Appel API
  SELECT status, content::jsonb
    INTO v_status, v_body
  FROM http_get('https://api.frankfurter.dev/v1/latest');

  IF v_status <> 200 THEN
    RAISE EXCEPTION 'FX API error: status=%', v_status;
  END IF;

  v_date := (v_body->>'date')::date;

  -- 2) Codes détectés (EUR + clés de rates)
  WITH codes AS (
    SELECT 'EUR'::text AS code
    UNION ALL
    SELECT key::text AS code
    FROM jsonb_each(v_body->'rates')
  ),
  map AS (
    SELECT * FROM (VALUES
      ('EUR','Euro','€'),
      ('USD','US Dollar','$'),
      ('GBP','Pound Sterling','£'),
      ('CHF','Swiss Franc','CHF'),
      ('JPY','Japanese Yen','¥'),
      ('CAD','Canadian Dollar','$'),
      ('AUD','Australian Dollar','$'),
      ('NZD','New Zealand Dollar','$'),
      ('SEK','Swedish Krona','kr'),
      ('NOK','Norwegian Krone','kr'),
      ('DKK','Danish Krone','kr'),
      ('PLN','Polish Złoty','zł'),
      ('CZK','Czech Koruna','Kč'),
      ('HUF','Hungarian Forint','Ft'),
      ('RON','Romanian Leu','lei'),
      ('TRY','Turkish Lira','₺'),
      ('CNY','Chinese Yuan','¥'),
      ('HKD','Hong Kong Dollar','$'),
      ('SGD','Singapore Dollar','$'),
      ('ZAR','South African Rand','R'),
      ('MXN','Mexican Peso','$'),
      ('BRL','Brazilian Real','R$'),
      ('INR','Indian Rupee','₹'),
      ('KRW','South Korean Won','₩')
    ) AS t(code, name, symbol)
  ),
  to_insert AS (
    SELECT
      c.code,
      COALESCE(m.name, c.code)   AS name,
      COALESCE(m.symbol, c.code) AS symbol
    FROM codes c
    LEFT JOIN map m USING (code)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.currencies cur WHERE cur.code = c.code
    )
  )
  INSERT INTO public.currencies(code, name, symbol)
  SELECT code, name, symbol
  FROM to_insert;

  -- 4) Upsert des taux (eur_per_unit = EUR pour 1 [code])
  INSERT INTO public.currency_rates(currency_code, valid_from, eur_per_unit)
  SELECT s.code,
         v_date,
         CASE
           WHEN s.code = 'EUR' THEN 1.000000
           ELSE ROUND(1.0 / (s.rate_per_eur)::numeric, 6)
         END AS eur_per_unit
  FROM (
    SELECT 'EUR'::text AS code, NULL::numeric AS rate_per_eur
    UNION ALL
    SELECT key::text AS code, (value)::numeric AS rate_per_eur
    FROM jsonb_each(v_body->'rates')
  ) s
  ON CONFLICT (currency_code, valid_from) DO UPDATE
    SET eur_per_unit = EXCLUDED.eur_per_unit;
END;
$function$;

-- =========================================================
-- 4. Documents & lignes (factures, devis, avoirs…)
-- =========================================================

-- Calcul du total d'une ligne (qty * unit_price - remises)
CREATE OR REPLACE FUNCTION public.document_lines_compute_total()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_base numeric;
BEGIN
  v_base := NEW.qty * NEW.unit_price;

  NEW.line_total := v_base
                    - COALESCE(NEW.discount_amount, 0)
                    - COALESCE(v_base * COALESCE(NEW.discount_rate, 0), 0);

  RETURN NEW;
END;
$function$;

-- Recalcule les totaux du document après changement d'une ligne
CREATE OR REPLACE FUNCTION public.document_lines_after_change_recalc()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  PERFORM public.documents_recalc_totals(COALESCE(NEW.document_id, OLD.document_id));
  RETURN NULL;
END;
$function$;

-- Recalcule subtotal / tax / total / total_eur sur un document
CREATE OR REPLACE FUNCTION public.documents_recalc_totals(p_document_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  v_sub   numeric;
  v_tax   numeric;
  v_total numeric;
  v_fx    numeric;
BEGIN
  SELECT COALESCE(SUM(line_total), 0) INTO v_sub
  FROM public.document_lines
  WHERE document_id = p_document_id;

  SELECT COALESCE(SUM(line_total * COALESCE(tax_rate, 0)), 0) INTO v_tax
  FROM public.document_lines
  WHERE document_id = p_document_id;

  SELECT fx_eur_per_unit_snapshot INTO v_fx
  FROM public.documents
  WHERE id = p_document_id;

  v_total := v_sub + v_tax;

  UPDATE public.documents
  SET subtotal  = ROUND(v_sub, 2),
      tax       = ROUND(v_tax, 2),
      total     = ROUND(v_total, 2),
      total_eur = CASE
                    WHEN v_fx IS NULL THEN NULL
                    ELSE ROUND(v_total * v_fx, 2)
                  END,
      updated_at = now()
  WHERE id = p_document_id;
END;
$function$;

-- Snapshot du taux de change sur le document
CREATE OR REPLACE FUNCTION public.documents_set_fx_snapshot()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_rate numeric(18, 6);
BEGIN
  IF (TG_OP = 'INSERT')
     OR (NEW.currency_code IS DISTINCT FROM COALESCE(OLD.currency_code, NEW.currency_code))
     OR (NEW.issue_date   IS DISTINCT FROM COALESCE(OLD.issue_date, NEW.issue_date))
  THEN
    SELECT eur_per_unit INTO v_rate
    FROM public.currency_rates
    WHERE currency_code = NEW.currency_code
      AND valid_from <= NEW.issue_date
    ORDER BY valid_from DESC
    LIMIT 1;

    IF v_rate IS NULL THEN
      SELECT eur_per_unit INTO v_rate
      FROM public.currency_rates
      WHERE currency_code = NEW.currency_code
      ORDER BY valid_from DESC
      LIMIT 1;
    END IF;

    NEW.fx_eur_per_unit_snapshot := COALESCE(v_rate, 1.000000);
  END IF;

  RETURN NEW;
END;
$function$;

-- Applique les valeurs par défaut de la company sur les documents (factures, etc.)
-- (Nom historique "invoices_*" mais fonctionne sur public.documents)
CREATE OR REPLACE FUNCTION public.invoices_bi_apply_company_defaults()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  c record;
BEGIN
  IF NEW.company_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT
    payment_terms,
    penalty_rate,
    recovery_fee_enabled,
    default_currency
  INTO c
  FROM public.companies
  WHERE id = NEW.company_id;

  IF NEW.payment_terms IS NULL AND c.payment_terms IS NOT NULL THEN
    NEW.payment_terms := c.payment_terms;
  END IF;

  IF NEW.penalty_rate IS NULL AND c.penalty_rate IS NOT NULL THEN
    NEW.penalty_rate := c.penalty_rate;
  END IF;

  IF NEW.recovery_fee IS NULL AND c.recovery_fee_enabled IS NOT NULL THEN
    NEW.recovery_fee := c.recovery_fee_enabled;
  END IF;

  IF NEW.currency_code IS NULL AND c.default_currency IS NOT NULL THEN
    NEW.currency_code := c.default_currency;
  END IF;

  RETURN NEW;
END;
$function$;

-- Numérotation des documents via document_sequences
CREATE OR REPLACE FUNCTION public.documents_assign_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_next int;
BEGIN
  IF NEW.sequence_number IS NULL THEN
    INSERT INTO public.document_sequences(company_id, kind, year)
    VALUES (NEW.company_id, NEW.kind, EXTRACT(YEAR FROM NEW.issue_date)::int)
    ON CONFLICT (company_id, kind, year) DO NOTHING;

    UPDATE public.document_sequences
      SET next_number = next_number + 1
      WHERE company_id = NEW.company_id
        AND kind       = NEW.kind
        AND year       = EXTRACT(YEAR FROM NEW.issue_date)::int
      RETURNING next_number - 1 INTO v_next;

    NEW.sequence_number := v_next;
  END IF;

  IF NEW.number IS NULL THEN
    NEW.number :=
      lpad(EXTRACT(YEAR FROM NEW.issue_date)::text, 4, '0')
      || '-' ||
      lpad(NEW.sequence_number::text, 6, '0');
  END IF;

  IF NEW.number_readonly IS NULL THEN
    NEW.number_readonly := NEW.number;
  END IF;

  RETURN NEW;
END;
$function$;


-- RPC appelé par DocumentsApi.generateNumber() pour finaliser un document
-- Incrémente atomiquement le compteur document_sequences et retourne le numéro généré.
-- Même logique que le trigger documents_assign_number(), mais invocable explicitement
-- (ex : finalisation d'un brouillon qui doit recevoir son numéro définitif).
CREATE OR REPLACE FUNCTION public.generate_document_number(
  p_company_id uuid,
  p_kind       text,
  p_issue_date date
)
RETURNS TABLE (number_value text, number_readonly text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year int  := EXTRACT(YEAR FROM p_issue_date)::int;
  v_seq  int;
  v_num  text;
BEGIN
  -- Crée la ligne de séquence si elle n'existe pas encore
  INSERT INTO public.document_sequences (company_id, kind, year)
  VALUES (p_company_id, p_kind, v_year)
  ON CONFLICT (company_id, kind, year) DO NOTHING;

  -- Incrémente et récupère la valeur courante (avant l'incrément)
  UPDATE public.document_sequences
    SET next_number = next_number + 1
    WHERE company_id = p_company_id
      AND kind       = p_kind
      AND year       = v_year
    RETURNING next_number - 1 INTO v_seq;

  v_num := lpad(v_year::text, 4, '0') || '-' || lpad(v_seq::text, 6, '0');

  RETURN QUERY SELECT v_num, v_num;
END;
$$;


-- Création automatique du membership "owner" après création d'une company
CREATE OR REPLACE FUNCTION public.companies_ai_create_owner_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.company_memberships (company_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Empêche la suppression du dernier membership "owner" d'une company
CREATE OR REPLACE FUNCTION public.company_memberships_bd_prevent_last_owner_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owners_count int;
BEGIN
  -- si pas owner, on laisse faire
  IF OLD.role <> 'owner' THEN
    RETURN OLD;
  END IF;

  SELECT COUNT(*)
  INTO owners_count
  FROM public.company_memberships m
  WHERE m.company_id = OLD.company_id
    AND m.role = 'owner'
    AND m.id <> OLD.id;

  IF owners_count = 0 THEN
    RAISE EXCEPTION 'Cannot delete the last owner membership of the company';
  END IF;

  RETURN OLD;
END;
$$;

-- Synchronise company_id dans clients depuis membership_id
CREATE OR REPLACE FUNCTION public.clients_bi_sync_company_from_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mid_company uuid;
BEGIN
  IF NEW.membership_id IS NOT NULL THEN
    SELECT m.company_id INTO mid_company
    FROM public.company_memberships m
    WHERE m.id = NEW.membership_id;

    IF mid_company IS NULL THEN
      RAISE EXCEPTION 'Invalid membership_id';
    END IF;

    -- force la cohérence
    NEW.company_id := mid_company;
  END IF;

  RETURN NEW;
END;
$$;

-- Remplit membership_id à partir de company_id + auth.uid()
CREATE OR REPLACE FUNCTION public.clients_bi_set_membership_from_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mid uuid;
BEGIN
  -- Si déjà fourni, on ne touche pas (ça laisse la porte ouverte à un admin si besoin)
  IF NEW.membership_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Si pas de company_id, on ne peut rien deviner
  IF NEW.company_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Récupère le membership du user connecté pour cette company
  SELECT m.id INTO mid
  FROM public.company_memberships m
  WHERE m.company_id = NEW.company_id
    AND m.user_id = auth.uid()
  ORDER BY m.created_at DESC
  LIMIT 1;

  IF mid IS NULL THEN
    RAISE EXCEPTION 'No membership found for user % in company %', auth.uid(), NEW.company_id
      USING ERRCODE = '23503'; -- foreign_key_violation-like
  END IF;

  NEW.membership_id := mid;

  RETURN NEW;
END;
$$;


-- =========================================================
-- RPC transactionnel : remplacement atomique des lignes d'un document
-- =========================================================
-- Exécuté en une seule transaction PostgreSQL pour éviter les états
-- incohérents (lignes orphelines si delete échoue après upsert).
-- Appelé par DocumentLinesApi.replaceForDocument() côté TypeScript.
CREATE OR REPLACE FUNCTION public.replace_document_lines(
  p_document_id uuid,
  p_lines       jsonb   -- tableau JSON des lignes (avec ou sans "id")
)
RETURNS jsonb           -- { "upserted": int, "deleted": int }
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_incoming_ids  uuid[];
  v_deleted_count int;
  v_upsert_count  int;
BEGIN
  -- Collecter les IDs explicites des lignes entrantes
  -- (les nouvelles lignes sans id n'ont pas encore de UUID côté client)
  SELECT COALESCE(
    array_agg((elem->>'id')::uuid) FILTER (WHERE elem->>'id' IS NOT NULL),
    '{}'::uuid[]
  )
  INTO v_incoming_ids
  FROM jsonb_array_elements(p_lines) AS elem;

  -- Supprimer atomiquement les lignes absentes du nouveau set
  -- Si v_incoming_ids = '{}', id != ALL('{}') est toujours TRUE → tout supprimer
  DELETE FROM public.document_lines
  WHERE document_id = p_document_id
    AND id != ALL(v_incoming_ids);

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  -- Upsert des lignes entrantes (insert ou update selon la présence d'un id)
  INSERT INTO public.document_lines (
    id, document_id, kind, description,
    qty, unit_price, unit,
    discount_rate, discount_amount, tax_rate,
    line_total, position
  )
  SELECT
    COALESCE(NULLIF(elem->>'id', '')::uuid, gen_random_uuid()),
    p_document_id,
    elem->>'kind',
    elem->>'description',
    (elem->>'qty')::numeric,
    (elem->>'unit_price')::numeric,
    NULLIF(elem->>'unit', ''),
    (elem->>'discount_rate')::numeric,
    (elem->>'discount_amount')::numeric,
    (elem->>'tax_rate')::numeric,
    (elem->>'line_total')::numeric,
    (elem->>'position')::integer
  FROM jsonb_array_elements(p_lines) AS elem
  ON CONFLICT (id) DO UPDATE SET
    kind            = EXCLUDED.kind,
    description     = EXCLUDED.description,
    qty             = EXCLUDED.qty,
    unit_price      = EXCLUDED.unit_price,
    unit            = EXCLUDED.unit,
    discount_rate   = EXCLUDED.discount_rate,
    discount_amount = EXCLUDED.discount_amount,
    tax_rate        = EXCLUDED.tax_rate,
    line_total      = EXCLUDED.line_total,
    position        = EXCLUDED.position,
    updated_at      = now();

  GET DIAGNOSTICS v_upsert_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'upserted', v_upsert_count,
    'deleted',  v_deleted_count
  );
END;
$$;
