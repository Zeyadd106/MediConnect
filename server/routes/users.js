import express from 'express';
import { db, publicUser } from '../db.js';
import { authRequired } from '../auth.js';

const router = express.Router();
router.use(authRequired);

function listByRole(role, search) {
  if (search) {
    return db
      .prepare(
        `SELECT * FROM users WHERE role = ? AND (name LIKE ? OR details LIKE ?) ORDER BY name`
      )
      .all(role, `%${search}%`, `%${search}%`)
      .map(publicUser);
  }
  return db
    .prepare('SELECT * FROM users WHERE role = ? ORDER BY name')
    .all(role)
    .map(publicUser);
}

router.get('/doctors', (req, res) => {
  res.json(listByRole('doctor', req.query.search));
});

router.get('/patients', (req, res) => {
  res.json(listByRole('patient', req.query.search));
});

export default router;
