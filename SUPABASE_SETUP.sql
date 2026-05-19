-- ═══════════════════════════════════════════════
--  SUPABASE SETUP — KinkList
--  Colle tout ça dans l'éditeur SQL de Supabase
-- ═══════════════════════════════════════════════

-- 1. TABLE PRINCIPALE — profils des utilisateurs
CREATE TABLE IF NOT EXISTS kinklist (
  username       TEXT PRIMARY KEY,
  email          TEXT,
  answers        JSONB DEFAULT '{}'::jsonb,
  compare_token  TEXT UNIQUE,
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLE HISTORIQUE — chaque changement enregistré
CREATE TABLE IF NOT EXISTS kink_history (
  id          BIGSERIAL PRIMARY KEY,
  username    TEXT NOT NULL,
  item        TEXT NOT NULL,
  side        TEXT DEFAULT '',
  from_val    TEXT,
  to_val      TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index pour accélérer les recherches admin
CREATE INDEX IF NOT EXISTS idx_history_username ON kink_history(username);
CREATE INDEX IF NOT EXISTS idx_history_created  ON kink_history(created_at DESC);

-- 3. TABLE INVITATIONS
CREATE TABLE IF NOT EXISTS invitations (
  token       TEXT PRIMARY KEY,
  label       TEXT,
  created_by  TEXT,
  used_by     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
--  SÉCURITÉ — Row Level Security (RLS)
--  IMPORTANT : active le RLS mais rend tout lisible
--  via la clé anon (suffisant pour une app privée)
-- ═══════════════════════════════════════════════

-- Active RLS
ALTER TABLE kinklist    ENABLE ROW LEVEL SECURITY;
ALTER TABLE kink_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations  ENABLE ROW LEVEL SECURITY;

-- Policies : accès total avec la clé anon
-- (ton app utilise la clé anon côté client)
CREATE POLICY "allow_all_kinklist"
  ON kinklist FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_history"
  ON kink_history FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_invitations"
  ON invitations FOR ALL USING (true) WITH CHECK (true);
