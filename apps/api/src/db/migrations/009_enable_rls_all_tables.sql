-- ─── Fix set_updated_at() — add fixed search_path (Supabase security advisor) ──
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ─── is_admin() helper ────────────────────────────────────────────────────────
-- SECURITY DEFINER so it can bypass RLS on admins table when checking admin status.
-- Fixed search_path prevents search_path injection.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE email = auth.email()
  );
$$;

-- ─── users ────────────────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read any profile (needed to show seller info on listings)
CREATE POLICY "users_select" ON users
  FOR SELECT TO authenticated USING (true);

-- Users can only insert their own profile row
CREATE POLICY "users_insert" ON users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Users can update their own profile; admins can update any
CREATE POLICY "users_update" ON users
  FOR UPDATE TO authenticated
  USING     (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- Only admins can delete user rows
CREATE POLICY "users_delete" ON users
  FOR DELETE TO authenticated USING (is_admin());

-- ─── listings ─────────────────────────────────────────────────────────────────
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can browse listings
CREATE POLICY "listings_select" ON listings
  FOR SELECT TO authenticated USING (true);

-- Users can only create listings under their own user_id
CREATE POLICY "listings_insert" ON listings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings; admins can update any
CREATE POLICY "listings_update" ON listings
  FOR UPDATE TO authenticated
  USING     (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- Users can delete their own listings; admins can delete any
CREATE POLICY "listings_delete" ON listings
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR is_admin());

-- ─── swipes ───────────────────────────────────────────────────────────────────
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own swipe history
CREATE POLICY "swipes_select" ON swipes
  FOR SELECT TO authenticated USING (auth.uid() = swiper_id);

-- Users can only record swipes as themselves
CREATE POLICY "swipes_insert" ON swipes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = swiper_id);

-- ─── matches ──────────────────────────────────────────────────────────────────
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Users see only matches they are a party to; admins see all
CREATE POLICY "matches_select" ON matches
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2 OR is_admin());

-- Users can create a match where they are one of the two parties
CREATE POLICY "matches_insert" ON matches
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Only admins can update match status (e.g. mark completed)
CREATE POLICY "matches_update" ON matches
  FOR UPDATE TO authenticated
  USING     (is_admin())
  WITH CHECK (is_admin());

-- ─── messages ─────────────────────────────────────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only read messages in matches they are part of
CREATE POLICY "messages_select" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = messages.match_id
        AND (matches.user_id_1 = auth.uid() OR matches.user_id_2 = auth.uid())
    )
  );

-- Users can only send messages as themselves, inside their own matches
CREATE POLICY "messages_insert" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_id
        AND (matches.user_id_1 = auth.uid() OR matches.user_id_2 = auth.uid())
    )
  );

-- ─── admins ───────────────────────────────────────────────────────────────────
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins can read their own row (used by admin page to verify access).
-- is_admin() uses SECURITY DEFINER so it reads the table directly and is
-- not affected by this policy.
CREATE POLICY "admins_self_select" ON admins
  FOR SELECT TO authenticated USING (auth.email() = email);
