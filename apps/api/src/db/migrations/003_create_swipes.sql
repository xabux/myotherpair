DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'swipe_direction_enum') THEN
    CREATE TYPE swipe_direction_enum AS ENUM ('pass', 'match', 'super');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS swipes (
  id          UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id   UUID                  NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  listing_id  UUID                  NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  direction   swipe_direction_enum  NOT NULL,
  created_at  TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  UNIQUE (swiper_id, listing_id)
);

CREATE INDEX IF NOT EXISTS swipes_swiper_id_idx   ON swipes(swiper_id);
CREATE INDEX IF NOT EXISTS swipes_listing_id_idx  ON swipes(listing_id);
