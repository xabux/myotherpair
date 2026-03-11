-- Enable RLS on the internal _migrations table so it is not accessible
-- via PostgREST / Supabase REST API. No policies are added, which means
-- all access is denied by default through the API. Direct DB connections
-- (used by the migration runner) are unaffected.
ALTER TABLE _migrations ENABLE ROW LEVEL SECURITY;
