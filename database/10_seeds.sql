-- =====================================================================
-- InvoiceFlow — Seeds (développement / CI)
-- =====================================================================

-- ⚠️ Ce fichier NE DOIT PAS contenir de données sensibles.
-- ⚠️ Il ne doit JAMAIS écraser de données existantes.
-- ⚠️ Il peut être appliqué à la main sur une instance vierge.

-- 1) Devise EUR obligatoire
INSERT INTO public.currencies (code, name, symbol)
VALUES ('EUR', 'Euro', '€')
ON CONFLICT (code) DO NOTHING;

-- 2) Taux EUR par défaut
INSERT INTO public.currency_rates (currency_code, valid_from, eur_per_unit)
VALUES ('EUR', CURRENT_DATE, 1.000000)
ON CONFLICT DO NOTHING;

-- 3) Utilisateur de test (CI / local)
-- ⚠️ Dépend de auth.users : à utiliser uniquement en local
-- (Supabase CLI seed)
-- Exemple :
-- INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-000000000001', 'dev@example.com');

-- 4) Settings par défaut pour cet utilisateur
-- INSERT INTO public.settings (user_id, tax_rate)
-- VALUES ('00000000-0000-0000-0000-000000000001', 0.20)
-- ON CONFLICT DO NOTHING;

-- 5) Entreprise de test
-- INSERT INTO public.companies (id, user_id, name)
-- VALUES (
--   '10000000-0000-0000-0000-000000000001',
--   '00000000-0000-0000-0000-000000000001',
--   'Entreprise Démo'
-- )
-- ON CONFLICT DO NOTHING;

-- 6) Membership owner
-- INSERT INTO public.company_memberships (company_id, user_id, role)
-- VALUES (
--   '10000000-0000-0000-0000-000000000001',
--   '00000000-0000-0000-0000-000000000001',
--   'owner'
-- )
-- ON CONFLICT DO NOTHING;
