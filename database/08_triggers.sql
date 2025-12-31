-- =====================================================================
-- InvoiceFlow — Triggers (public)
-- =====================================================================
-- Ce fichier définit tous les triggers applicatifs :
-- - Utilitaires : set_user_id / set_updated_at
-- - Documents : numérotation, FX, defaults
-- - Document lines : calcul des totaux + recalcul document
-- - Vue invoices : triggers INSTEAD OF pour insert/update
-- =====================================================================


-- =========================================================
-- 1. Triggers utilitaires : set_user_id / set_updated_at
-- =========================================================

-- Remplissage automatique de user_id si présent et NULL

CREATE TRIGGER trg_set_user_id_clients
  BEFORE INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER trg_set_user_id_companies
  BEFORE INSERT ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER trg_set_user_id_documents
  BEFORE INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER trg_set_user_id_email_logs
  BEFORE INSERT ON public.email_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER trg_set_user_id_files
  BEFORE INSERT ON public.files
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER trg_set_user_id_payments
  BEFORE INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER trg_set_user_id_settings
  BEFORE INSERT ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();



-- Mise à jour automatique de updated_at si la colonne existe

CREATE TRIGGER trg_updated_at_clients
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_currencies
  BEFORE UPDATE ON public.currencies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_email_logs
  BEFORE UPDATE ON public.email_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_settings
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_companies
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_client_addresses
  BEFORE UPDATE ON public.client_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_client_contacts
  BEFORE UPDATE ON public.client_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_company_addresses
  BEFORE UPDATE ON public.company_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_company_bank_accounts
  BEFORE UPDATE ON public.company_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_company_memberships
  BEFORE UPDATE ON public.company_memberships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_documents
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_document_lines
  BEFORE UPDATE ON public.document_lines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_payments
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_updated_at_files
  BEFORE UPDATE ON public.files
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

create trigger trg_countries_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();



-- =========================================================
-- 2. Documents — FX, numérotation, defaults
-- =========================================================

CREATE TRIGGER trg_documents_assign_number
  BEFORE INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.documents_assign_number();

CREATE TRIGGER trg_documents_set_fx
  BEFORE INSERT OR UPDATE OF currency_code, issue_date
  ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.documents_set_fx_snapshot();

CREATE TRIGGER trg_documents_apply_company_defaults
  BEFORE INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.invoices_bi_apply_company_defaults();



-- =========================================================
-- 3. Document lines — total + recalcul du document
-- =========================================================

-- Calcul du total de ligne avant insert/update
CREATE TRIGGER trg_document_lines_compute_total
  BEFORE INSERT OR UPDATE OF qty, unit_price, discount_amount, discount_rate
  ON public.document_lines
  FOR EACH ROW EXECUTE FUNCTION public.document_lines_compute_total();

-- Recalcul du document après changement de lignes (INSERT/UPDATE/DELETE)
CREATE TRIGGER trg_document_lines_after_change
  AFTER INSERT OR UPDATE OR DELETE ON public.document_lines
  FOR EACH ROW EXECUTE FUNCTION public.document_lines_after_change_recalc();



-- =========================================================
-- 4. Companies — create owner membership + prevent last owner delete
-- =========================================================

-- Création automatique de la company_membership "owner" lors de la création d'une company
CREATE TRIGGER trg_companies_create_owner_membership
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.companies_ai_create_owner_membership();

-- Empêche la suppression de la dernière membership "owner" d'une company
CREATE TRIGGER trg_company_memberships_prevent_last_owner_delete
  BEFORE DELETE ON public.company_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.company_memberships_bd_prevent_last_owner_delete();


-- =========================================================
-- 5. Clients — sync company_id from membership_id
-- =========================================================

-- Synchronise company_id dans clients depuis la membership_id
CREATE TRIGGER trg_clients_sync_company_from_membership
BEFORE INSERT OR UPDATE OF membership_id ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.clients_bi_sync_company_from_membership();

-- Définit membership_id dans clients depuis company_id si membership_id NULL
CREATE TRIGGER trg_clients_set_membership_from_company
BEFORE INSERT OR UPDATE OF company_id ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.clients_bi_set_membership_from_company();
