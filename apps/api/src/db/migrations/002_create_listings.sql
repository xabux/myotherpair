DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'foot_side_enum') THEN
    CREATE TYPE foot_side_enum AS ENUM ('L', 'R', 'single');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_condition_enum') THEN
    CREATE TYPE listing_condition_enum AS ENUM (
      'new_with_tags',
      'new_without_tags',
      'excellent',
      'good',
      'fair',
      'poor'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status_enum') THEN
    CREATE TYPE listing_status_enum AS ENUM ('active', 'matched', 'sold');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS listings (
  id         UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID                    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shoe_brand TEXT                    NOT NULL,
  shoe_model TEXT                    NOT NULL,
  size       NUMERIC(4,1)            NOT NULL,
  foot_side  foot_side_enum          NOT NULL,
  condition  listing_condition_enum  NOT NULL,
  price      NUMERIC(10,2)           NOT NULL,
  photos     TEXT[]                  NOT NULL DEFAULT '{}',
  status     listing_status_enum     NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listings_user_id_idx   ON listings(user_id);
CREATE INDEX IF NOT EXISTS listings_status_idx    ON listings(status);
CREATE INDEX IF NOT EXISTS listings_foot_side_idx ON listings(foot_side);
CREATE INDEX IF NOT EXISTS listings_size_idx      ON listings(size);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listings_updated_at ON listings;
CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
