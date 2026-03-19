CREATE TABLE IF NOT EXISTS saved_listings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  listing_id  UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS saved_listings_user_id_idx    ON saved_listings(user_id);
CREATE INDEX IF NOT EXISTS saved_listings_listing_id_idx ON saved_listings(listing_id);
