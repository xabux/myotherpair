import { Router } from 'express';
import type { Request, Response } from 'express';
import { pool } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import type { CreateListingBody, UpdateListingBody } from '@myotherpair/types';

const router = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /listings — public, paginated
router.get('/', async (req: Request, res: Response) => {
  const page     = Math.max(1, parseInt(String(req.query['page']     ?? '1'),  10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(String(req.query['pageSize'] ?? '20'), 10) || 20));
  const offset = (page - 1) * pageSize;

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM listings WHERE status = 'active'`
  );
  const total: number = countRows[0].total;

  const { rows } = await pool.query(
    `SELECT * FROM listings WHERE status = 'active'
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [pageSize, offset]
  );

  res.json({ data: rows, total, page, pageSize });
});

// GET /listings/:id — public
router.get('/:id', async (req: Request, res: Response) => {
  if (!UUID_RE.test(String(req.params['id'] ?? ''))) {
    res.status(400).json({ error: 'Invalid listing ID' });
    return;
  }
  const { rows } = await pool.query('SELECT * FROM listings WHERE id = $1', [
    req.params['id'],
  ]);

  if (rows.length === 0) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }

  res.json({ data: rows[0] });
});

// POST /listings — authenticated
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const body = req.body as CreateListingBody;
  const { shoe_brand, shoe_model, size, foot_side, condition, price, photos } =
    body;

  if (!shoe_brand || !shoe_model || !size || !foot_side || !condition || price == null) {
    res.status(400).json({ error: 'Missing required listing fields' });
    return;
  }

  const { rows } = await pool.query(
    `INSERT INTO listings
       (user_id, shoe_brand, shoe_model, size, foot_side, condition, price, photos)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      req.userId,
      shoe_brand,
      shoe_model,
      size,
      foot_side,
      condition,
      price,
      photos ?? [],
    ]
  );

  res.status(201).json({ data: rows[0] });
});

// PATCH /listings/:id — authenticated, owner only
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  if (!UUID_RE.test(String(req.params['id'] ?? ''))) {
    res.status(400).json({ error: 'Invalid listing ID' });
    return;
  }
  const { rows: existing } = await pool.query(
    'SELECT user_id FROM listings WHERE id = $1',
    [req.params['id']]
  );

  if (existing.length === 0) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }

  if (existing[0].user_id !== req.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const body = req.body as UpdateListingBody;
  const allowed = [
    'shoe_brand',
    'shoe_model',
    'size',
    'foot_side',
    'condition',
    'price',
    'photos',
    'status',
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

  values.push(req.params['id']);
  const { rows } = await pool.query(
    `UPDATE listings SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  res.json({ data: rows[0] });
});

// DELETE /listings/:id — authenticated, owner only
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  if (!UUID_RE.test(String(req.params['id'] ?? ''))) {
    res.status(400).json({ error: 'Invalid listing ID' });
    return;
  }
  const { rows } = await pool.query(
    'SELECT user_id FROM listings WHERE id = $1',
    [req.params['id']]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }

  if (rows[0].user_id !== req.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  await pool.query('DELETE FROM listings WHERE id = $1', [req.params['id']]);
  res.status(204).send();
});

export default router;
