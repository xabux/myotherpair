CREATE TABLE IF NOT EXISTS messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID        NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id   UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  content     TEXT        NOT NULL CHECK (content <> ''),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_match_id_idx  ON messages(match_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
