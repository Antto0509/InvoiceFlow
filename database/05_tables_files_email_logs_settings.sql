-- =====================================================================
--  Fichiers & liens
-- =====================================================================

-- Fichiers stockés (lien vers storage)
CREATE TABLE public.files (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL, -- propriétaire / uploader
  bucket      text NOT NULL,
  path        text NOT NULL,
  mime_type   text,
  size_bytes  integer,
  created_at  timestamp with time zone DEFAULT now(),
  CONSTRAINT files_pkey PRIMARY KEY (id),
  CONSTRAINT files_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Liens entre fichiers et entités métier (documents, etc.)
CREATE TABLE public.file_links (
  file_id      uuid NOT NULL,
  target_table text NOT NULL, -- ex: 'documents'
  target_id    uuid NOT NULL,
  created_at   timestamp with time zone DEFAULT now(),
  CONSTRAINT file_links_pkey PRIMARY KEY (file_id, target_table, target_id),
  CONSTRAINT file_links_file_id_fkey
    FOREIGN KEY (file_id) REFERENCES public.files(id)
);

-- =====================================================================
--  Logs d'emails & paramètres utilisateur
-- =====================================================================

-- Logs d'emails envoyés (notifications, envoi de factures, etc.)
CREATE TABLE public.email_logs (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id     uuid, -- qui a déclenché l'envoi
  to_email    text,
  subject     text,
  status      text, -- ex: 'sent', 'failed'
  created_at  timestamp with time zone DEFAULT now(),
  updated_at  timestamp with time zone DEFAULT now(),
  document_id uuid,
  CONSTRAINT email_logs_pkey PRIMARY KEY (id),
  CONSTRAINT email_logs_document_id_fkey
    FOREIGN KEY (document_id) REFERENCES public.documents(id),
  CONSTRAINT email_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Paramètres par utilisateur (signatures, mentions légales, etc.)
CREATE TABLE public.settings (
  user_id    uuid NOT NULL,
  logo_url   text,
  legal_notes text,
  bank_info  text,
  tax_rate   numeric NOT NULL DEFAULT 0.20,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT settings_pkey PRIMARY KEY (user_id),
  CONSTRAINT settings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);
