import { Router } from 'express';
import type { Request, Response } from 'express';
import { pool } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import type { UpdateUserBody } from '@myotherpair/types';

const router = Router();

// GET /users/me — authenticated
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [
    req.userId,
  ]);

  if (rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ data: rows[0] });
});

// PATCH /users/me — authenticated
router.patch('/me', requireAuth, async (req: Request, res: Response) => {
  const body = req.body as UpdateUserBody;
  const allowed = [
    'name',
    'avatar_url',
    'foot_size_left',
    'foot_size_right',
    'is_amputee',
    'location',
  ] as const;

  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const key of allowed) {
    if (key in body) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(body[key]);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No valid fields to update' });
    return;
  }

  values.push(req.userId);
  const { rows } = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  res.json({ data: rows[0] });
});

// GET /users/:id — public
router.get('/:id', async (req: Request, res: Response) => {
  const { rows } = await pool.query(
    'SELECT id, name, avatar_url, location, created_at FROM users WHERE id = $1',
    [req.params['id']]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ data: rows[0] });
});

export default router;
