-- =====================================================================
-- InvoiceFlow — Views (public)
-- =====================================================================
-- Ce fichier définit les vues utilisées par l’application :
-- - Vues métier (invoices, items, documents_with_client, currency_rates_latest)
-- - Vue d’inspection des policies RLS (policies_overview)
--
-- NOTE :
-- - Les vues sont déclarées en CREATE OR REPLACE VIEW pour être
--   rejouables sans DROP préalable.
-- - Elles reposent sur le schéma défini dans schema_reference.sql.
-- =====================================================================


-- =====================================================================
-- 1. FX / Devises
-- =====================================================================

-- Dernier taux connu par devise (EUR de référence)
CREATE OR REPLACE VIEW public.currency_rates_latest AS
SELECT DISTINCT ON (UPPER(cr.currency_code))
  UPPER(cr.currency_code) AS currency_code,
  cr.valid_from,
  cr.eur_per_unit
FROM public.currency_rates cr
ORDER BY
  UPPER(cr.currency_code),
  cr.valid_from DESC;


-- =====================================================================
-- 2. Documents enrichis
-- =====================================================================

-- Documents avec nom du client (pratique pour les listes)
CREATE OR REPLACE VIEW public.documents_with_client AS
SELECT
  d.id,
  d.user_id,
  d.client_id,
  d.company_id,
  d.number,
  d.number_readonly,
  d.sequence_number,
  d.issue_year,
  d.status,
  d.kind,
  d.issue_date,
  d.due_date,
  d.supply_date,
  d.currency_code,
  d.subtotal,
  d.tax,
  d.total,
  d.fx_eur_per_unit_snapshot,
  d.total_eur,
  d.payment_terms,
  d.penalty_rate,
  d.recovery_fee,
  d.purchase_order_number,
  d.notes_public,
  d.notes_private,
  d.pdf_url,
  d.reference_document_id,
  d.created_at,
  d.updated_at,
  c.name AS client_name
FROM public.documents d
LEFT JOIN public.clients c ON c.id = d.client_id;


-- =====================================================================
-- 3. Vues de compatibilité legacy : invoices
-- =====================================================================
-- Cette vue permet de conserver une compatibilité avec l’ancienne
-- structure de la base de données, où seules les factures existaient.
-- Elle est utilisable en lecture, et peut être rendue updatable 
-- via des triggers INSTEAD OF dans triggers.sql.
-- =====================================================================

-- Vue des factures (compatibilité legacy)
CREATE OR REPLACE VIEW public.invoices AS
SELECT
  d.id,
  d.user_id,
  d.client_id,
  d.number,
  CASE d.status
    WHEN 'draft'::public.doc_status   THEN 'draft'::text
    WHEN 'sent'::public.doc_status    THEN 'sent'::text
    WHEN 'paid'::public.doc_status    THEN 'paid'::text
    WHEN 'overdue'::public.doc_status THEN 'overdue'::text
    ELSE d.status::text
  END AS status,
  d.issue_date,
  d.due_date,
  'EUR'::text AS currency_legacy,  -- colonne legacy figée
  d.subtotal,
  d.pdf_url,
  d.created_at,
  NULL::numeric AS tax_rate,       -- placeholder legacy
  d.tax,
  d.total,
  d.currency_code,
  d.fx_eur_per_unit_snapshot,
  d.total_eur,
  d.updated_at,
  d.company_id,
  d.issue_year,
  d.sequence_number,
  d.number_readonly,
  d.supply_date,
  d.payment_terms,
  d.penalty_rate,
  d.recovery_fee,
  d.purchase_order_number,
  d.notes_public,
  d.notes_private,
  d.kind,
  d.reference_document_id AS reference_invoice_id
FROM public.documents d
WHERE d.kind = 'invoice'::public.doc_kind;


-- =====================================================================
-- 4. Vue d’inspection des policies RLS
-- =====================================================================
-- Vue technique pour auditer facilement les RLS en place.
-- Très pratique en dev / debug, à exposer uniquement à un rôle admin.
-- =====================================================================

CREATE OR REPLACE VIEW public.policies_overview AS
SELECT
  n.nspname              AS schemaname,
  c.relname              AS tablename,
  c.relrowsecurity       AS rls_enabled,
  c.relforcerowsecurity  AS rls_forced,
  p.policyname           AS policy,
  p.cmd                  AS action,
  p.roles,
  p.permissive,
  p.qual                 AS using_expr,
  p.with_check           AS check_expr
FROM pg_class c
JOIN pg_namespace n
  ON n.oid = c.relnamespace
LEFT JOIN pg_policies p
  ON p.schemaname = n.nspname
 AND p.tablename  = c.relname
WHERE c.relkind = 'r'::"char"
  AND n.nspname <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]);
