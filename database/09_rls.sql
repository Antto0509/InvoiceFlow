-- =====================================================================
-- InvoiceFlow — RLS policies (public)
-- =====================================================================

-- =========================================================
-- 1) company_memberships
-- =========================================================
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;

-- ✅ SELECT : je peux voir uniquement MES memberships
CREATE POLICY memberships_select_own
  ON public.company_memberships
  FOR SELECT TO public
  USING (user_id = auth.uid());

-- ❌ INSERT depuis le client : interdit (sinon auto-invite dans n’importe quelle company)
-- -> la création du membership owner se fait par trigger côté DB (voir plus bas)

-- ✅ DELETE : je peux quitter une company (mais trigger empêchera de supprimer le dernier owner)
CREATE POLICY memberships_delete_self
  ON public.company_memberships
  FOR DELETE TO public
  USING (user_id = auth.uid());

-- Pas de UPDATE exposé


-- =========================================================
-- 2) currencies / currency_rates (lecture globale)
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
-- 3) users (profil applicatif)
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

-- Pas d'insert/delete côté client (triggers auth.users)


-- =========================================================
-- 4) settings (par utilisateur)
-- =========================================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY settings_all_self
  ON public.settings
  FOR ALL TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- =========================================================
-- 5) companies + company_addresses + company_bank_accounts
-- =========================================================
ALTER TABLE public.companies              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_addresses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_bank_accounts  ENABLE ROW LEVEL SECURITY;

-- Companies:
-- - SELECT : tout membre OU owner
-- - INSERT/UPDATE/DELETE : owner logique (companies.user_id)
CREATE POLICY companies_select_member
  ON public.companies
  FOR SELECT TO public
  USING (
    (
      (user_id = auth.uid()) OR (
        EXISTS ( 
          SELECT 1
          FROM company_memberships m
          WHERE ((m.company_id = companies.id) AND (m.user_id = auth.uid()))
        )
      )
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

-- Company addresses:
-- - SELECT : membre
-- - ALL (write) : owner de la company
CREATE POLICY company_addresses_select_member
  ON public.company_addresses
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = company_addresses.company_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY company_addresses_modify_owner
  ON public.company_addresses
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.companies c
      WHERE c.id = company_addresses.company_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.companies c
      WHERE c.id = company_addresses.company_id
        AND c.user_id = auth.uid()
    )
  );

-- Company bank accounts:
-- - SELECT : membre
-- - ALL (write) : owner de la company
CREATE POLICY company_bank_accounts_select_member
  ON public.company_bank_accounts
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = company_bank_accounts.company_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY company_bank_accounts_modify_owner
  ON public.company_bank_accounts
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.companies c
      WHERE c.id = company_bank_accounts.company_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.companies c
      WHERE c.id = company_bank_accounts.company_id
        AND c.user_id = auth.uid()
    )
  );


-- =========================================================
-- 6) clients + client_addresses + client_contacts (par company)
-- =========================================================
ALTER TABLE public.clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts  ENABLE ROW LEVEL SECURITY;

-- Clients: membre de la company
CREATE POLICY clients_member_all
  ON public.clients
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = clients.company_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company_memberships m
      WHERE m.company_id = clients.company_id
        AND m.user_id = auth.uid()
    )
  );

-- Addresses: via client -> company -> membership
CREATE POLICY client_addresses_member_all
  ON public.client_addresses
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients c
      JOIN public.company_memberships m ON m.company_id = c.company_id
      WHERE c.id = client_addresses.client_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients c
      JOIN public.company_memberships m ON m.company_id = c.company_id
      WHERE c.id = client_addresses.client_id
        AND m.user_id = auth.uid()
    )
  );

-- Contacts: idem
CREATE POLICY client_contacts_member_all
  ON public.client_contacts
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients c
      JOIN public.company_memberships m ON m.company_id = c.company_id
      WHERE c.id = client_contacts.client_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients c
      JOIN public.company_memberships m ON m.company_id = c.company_id
      WHERE c.id = client_contacts.client_id
        AND m.user_id = auth.uid()
    )
  );


-- =========================================================
-- 7) documents + lines + sequences + reminders
-- =========================================================
ALTER TABLE public.documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_lines      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sequences  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_reminders  ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY document_lines_member_all
  ON public.document_lines
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.company_memberships m ON m.company_id = d.company_id
      WHERE d.id = document_lines.document_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.company_memberships m ON m.company_id = d.company_id
      WHERE d.id = document_lines.document_id
        AND m.user_id = auth.uid()
    )
  );

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

CREATE POLICY document_reminders_member_all
  ON public.document_reminders
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.company_memberships m ON m.company_id = d.company_id
      WHERE d.id = document_reminders.document_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.company_memberships m ON m.company_id = d.company_id
      WHERE d.id = document_reminders.document_id
        AND m.user_id = auth.uid()
    )
  );


-- =========================================================
-- 8) payments + payment_allocations
-- =========================================================
ALTER TABLE public.payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY payment_allocations_member_all
  ON public.payment_allocations
  FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.company_memberships m ON m.company_id = d.company_id
      WHERE d.id = payment_allocations.document_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.company_memberships m ON m.company_id = d.company_id
      WHERE d.id = payment_allocations.document_id
        AND m.user_id = auth.uid()
    )
  );


-- =========================================================
-- 9) email_logs (par user_id)
-- =========================================================
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_logs_all_own
  ON public.email_logs
  FOR ALL TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- =========================================================
-- 10) files + file_links (par user_id)
-- =========================================================
ALTER TABLE public.files      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY files_all_own
  ON public.files
  FOR ALL TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

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

-- =========================================================
-- 11) countries (lecture globale)
-- =========================================================

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY countries_read_all
  ON public.countries
  FOR SELECT TO public
  USING (true);
