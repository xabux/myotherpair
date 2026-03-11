import { Router } from 'express';
import type { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { pool } from '../db/client.js';
import { env } from '../config/env.js';
import type { AuthSignUpBody, AuthSignInBody } from '@myotherpair/types';

const router = Router();

// 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts — try again in 15 minutes' },
});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// POST /auth/sign-up
router.post('/sign-up', authLimiter, async (req: Request, res: Response) => {
  const { email, password, name } = req.body as AuthSignUpBody;

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    // Don't leak whether the email already exists
    res.status(400).json({ error: 'Could not create account — check your details and try again' });
    return;
  }

  // Mirror user into our users table
  await pool.query(
    `INSERT INTO users (id, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO NOTHING`,
    [data.user.id, email, name ?? null]
  );

  res.status(201).json({ data: { id: data.user.id, email } });
});

// POST /auth/sign-in
router.post('/sign-in', authLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body as AuthSignInBody;

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Generic message — don't reveal whether email exists
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  res.json({
    data: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  });
});

// POST /auth/sign-out — requires a valid token so we can revoke it
router.post('/sign-out', authLimiter, async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header required' });
    return;
  }
  const token = authHeader.slice(7);
  // Verify the token is valid before revoking (prevents token-scanning abuse)
  const { error: userErr } = await supabase.auth.getUser(token);
  if (userErr) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
  await supabase.auth.admin.signOut(token);
  res.json({ data: { message: 'Signed out' } });
});

export default router;
