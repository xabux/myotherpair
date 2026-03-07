DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status_enum') THEN
    CREATE TYPE match_status_enum AS ENUM ('pending', 'accepted', 'rejected', 'completed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS matches (
  id            UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id_1  UUID               NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  listing_id_2  UUID               NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id_1     UUID               NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  user_id_2     UUID               NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  status        match_status_enum  NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  UNIQUE (listing_id_1, listing_id_2)
);

CREATE INDEX IF NOT EXISTS matches_user_id_1_idx ON matches(user_id_1);
CREATE INDEX IF NOT EXISTS matches_user_id_2_idx ON matches(user_id_2);

DROP TRIGGER IF EXISTS matches_updated_at ON matches;
CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
