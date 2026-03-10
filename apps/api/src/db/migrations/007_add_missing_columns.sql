-- Add description to listings
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Add 'deleted' to listing_status_enum
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'deleted'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'listing_status_enum')
  ) THEN
    ALTER TYPE listing_status_enum ADD VALUE 'deleted';
  END IF;
END $$;

-- Add bio to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bio TEXT;
