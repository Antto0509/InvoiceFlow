-- =====================================================================
-- InvoiceFlow — RLS policies (public)
-- =====================================================================
-- Stratégie :
--  - Visibilité par entreprise via company_memberships
--  - Tables "profil" / "perso" par user_id
--  - Currencies : lecture ouverte
-- =====================================================================

-- =========================================================
-- 0. Helpers conceptuels (pas des fonctions, juste la logique)
-- =========================================================
-- Membre d'une entreprise :
--   EXISTS (
--     SELECT 1 FROM public.company_memberships m
--     WHERE m.company_id = <TABLE>.company_id
--       AND m.user_id = auth.uid()
--   );
--
-- Membre d'une entreprise via document :
--   EXISTS (
--     SELECT 1
--     FROM public.documents d
--     JOIN public.company_memberships m ON m.company_id = d.company_id
--     WHERE d.id = <TABLE>.document_id
--       AND m.user_id = auth.uid()
--   );
-- =========================================================


-- =========================================================
-- 1. company_memberships
-- =========================================================

ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY memberships_select_own
  ON public.company_memberships
  FOR SELECT TO public
  USING (user_id = auth.uid());

CREATE POLICY memberships_insert_self
  ON public.company_memberships
  FOR INSERT TO public
  WITH CHECK (user_id = auth.uid());

CREATE POLICY memberships_delete_self
  ON public.company_memberships
  FOR DELETE TO public
  USING (user_id = auth.uid());

-- (Pas de UPDATE exposé au client pour changer son rôle,
--  ça restera réservé à un rôle admin DB ou plus tard à un workflow dédié.)


-- =========================================================
-- 2. currencies / currency_rates (lecture globale)
-- =========================================================

ALTER TABLE public.currencies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_rates   ENABLE ROW LEVEL SECURITY;

CREATE POLICY currencies_read_all
  ON public.currencies
  FOR SELECT TO public
  USING (true);

CREATE POLICY currency_rates_read_all
  ON public.currency_rates
  FOR SELECT TO public
  USING (true);


-- =========================================================
-- 3. users (profil applicatif lié à auth.users)
-- =========================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_self
  ON public.users
  FOR SELECT TO public
  USING (id = auth.uid());

CREATE POLICY users_update_self
  ON public.users
  FOR UPDATE TO public
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Pas d'INSERT/DELETE via le client, c'est géré via les triggers sur auth.users.


-- =========================================================
-- 4. settings (par utilisateur)
-- =========================================================

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY settings_all_self
  ON public.settings
  FOR ALL TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- =========================================================
-- 5. companies & ressources rattachées à company_id
-- =========================================================

ALTER TABLE public.companies              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_addresses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_bank_accounts  ENABLE ROW LEVEL SECURITY;

-- Companies :
--  - SELECT : tout membre
--  - INSERT : user_id = auth.uid() (créateur)
--  - UPDATE/DELETE : owner (user_id = auth.uid()) pour l’instant

CREATE POLICY companies_select_member
  ON public.companies
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = companies.id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY companies_insert_owner
  ON public.companies
  FOR INSERT TO public
  WITH CHECK (user_id = auth.uid());

CREATE POLICY companies_update_owner
  ON public.companies
  FOR UPDATE TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY companies_delete_owner
  ON public.companies
  FOR DELETE TO public
  USING (user_id = auth.uid());

-- Adresses d’entreprise : tout membre a accès / modif

CREATE POLICY company_addresses_member_all
  ON public.company_addresses
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = company_addresses.company_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = company_addresses.company_id
        AND m.user_id = auth.uid()
    )
  );

-- Comptes bancaires d’entreprise

CREATE POLICY company_bank_accounts_member_all
  ON public.company_bank_accounts
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = company_bank_accounts.company_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = company_bank_accounts.company_id
        AND m.user_id = auth.uid()
    )
  );


-- =========================================================
-- 6. clients & dérivés (modèle encore user_id-based)
-- =========================================================

ALTER TABLE public.clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts  ENABLE ROW LEVEL SECURITY;

-- Clients : full contrôle par user_id (pour l’instant)
CREATE POLICY clients_all_own
  ON public.clients
  FOR ALL TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Adresses & contacts rattachés à des clients du user

CREATE POLICY client_addresses_all_own
  ON public.client_addresses
  FOR ALL TO public
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY client_contacts_all_own
  ON public.client_contacts
  FOR ALL TO public
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );


-- =========================================================
-- 7. documents, lignes, séquences, rappels
-- =========================================================

ALTER TABLE public.documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_lines      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sequences  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_reminders  ENABLE ROW LEVEL SECURITY;

-- Documents : accès pour tout membre de la company
CREATE POLICY documents_member_all
  ON public.documents
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = documents.company_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = documents.company_id
        AND m.user_id = auth.uid()
    )
  );

-- Lignes de documents : accès via membership sur la company du document
CREATE POLICY document_lines_member_all
  ON public.document_lines
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.company_memberships m
        ON m.company_id = d.company_id
      WHERE d.id = document_lines.document_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.company_memberships m
        ON m.company_id = d.company_id
      WHERE d.id = document_lines.document_id
        AND m.user_id = auth.uid()
    )
  );

-- Séquences : par company_id
CREATE POLICY document_sequences_member_all
  ON public.document_sequences
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = document_sequences.company_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = document_sequences.company_id
        AND m.user_id = auth.uid()
    )
  );

-- Rappels de documents : via document -> company -> membership
CREATE POLICY document_reminders_member_all
  ON public.document_reminders
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.company_memberships m
        ON m.company_id = d.company_id
      WHERE d.id = document_reminders.document_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.company_memberships m
        ON m.company_id = d.company_id
      WHERE d.id = document_reminders.document_id
        AND m.user_id = auth.uid()
    )
  );


-- =========================================================
-- 8. payments & payment_allocations
-- =========================================================

ALTER TABLE public.payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;

-- Payments : par company_id -> membership
CREATE POLICY payments_member_all
  ON public.payments
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = payments.company_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = payments.company_id
        AND m.user_id = auth.uid()
    )
  );

-- Payment allocations : via document -> company -> membership
CREATE POLICY payment_allocations_member_all
  ON public.payment_allocations
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.company_memberships m
        ON m.company_id = d.company_id
      WHERE d.id = payment_allocations.document_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.company_memberships m
        ON m.company_id = d.company_id
      WHERE d.id = payment_allocations.document_id
        AND m.user_id = auth.uid()
    )
  );


-- =========================================================
-- 9. email_logs (par user_id)
-- =========================================================

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_logs_all_own
  ON public.email_logs
  FOR ALL TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- =========================================================
-- 10. files & file_links
-- =========================================================

ALTER TABLE public.files      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_links ENABLE ROW LEVEL SECURITY;

-- Fichiers : par user_id (proprio du fichier)
CREATE POLICY files_all_own
  ON public.files
  FOR ALL TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Liens de fichiers : accès si on possède le file_id
CREATE POLICY file_links_all_own
  ON public.file_links
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.files f
      WHERE f.id = file_links.file_id
        AND f.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.files f
      WHERE f.id = file_links.file_id
        AND f.user_id = auth.uid()
    )
  );
