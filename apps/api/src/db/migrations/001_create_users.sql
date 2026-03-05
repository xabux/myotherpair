CREATE TABLE IF NOT EXISTS users (
  id              UUID        PRIMARY KEY,
  email           TEXT        UNIQUE NOT NULL,
  name            TEXT,
  avatar_url      TEXT,
  foot_size_left  NUMERIC(4,1),
  foot_size_right NUMERIC(4,1),
  is_amputee      BOOLEAN     NOT NULL DEFAULT FALSE,
  location        TEXT,
  stripe_account_id TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
