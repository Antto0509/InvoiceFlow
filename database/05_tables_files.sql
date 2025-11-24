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
