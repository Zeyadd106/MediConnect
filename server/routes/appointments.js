import express from 'express';
import { db, publicUser, newVideoRoom } from '../db.js';
import { authRequired } from '../auth.js';

const router = express.Router();
router.use(authRequired);

function withNames(row) {
  const doctor = publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(row.doctor_id));
  const patient = publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(row.patient_id));
  return { ...row, doctor, patient };
}

// List my appointments (doctor sees theirs, patient sees theirs)
router.get('/appointments', (req, res) => {
  const { id, role } = req.auth;
  const rows =
    role === 'doctor'
      ? db.prepare('SELECT * FROM appointments WHERE doctor_id = ? ORDER BY datetime(scheduled_at) ASC').all(id)
      : db.prepare('SELECT * FROM appointments WHERE patient_id = ? ORDER BY datetime(scheduled_at) ASC').all(id);
  res.json(rows.map(withNames));
});

// Patient books with a doctor
router.post('/appointments', (req, res) => {
  const { id, role } = req.auth;
  const { doctor_id, scheduled_at, reason } = req.body || {};
  if (!doctor_id || !scheduled_at) {
    return res.status(422).json({ message: 'doctor_id and scheduled_at are required' });
  }
  const doctor = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'doctor'").get(doctor_id);
  if (!doctor) return res.status(422).json({ message: 'Doctor not found' });
  const patientId = role === 'patient' ? id : req.body.patient_id;
  if (!patientId) return res.status(422).json({ message: 'patient_id is required' });
  const scheduled = new Date(scheduled_at);
  if (Number.isNaN(scheduled.getTime())) return res.status(422).json({ message: 'Invalid date' });

  const info = db
    .prepare(
      'INSERT INTO appointments (doctor_id, patient_id, scheduled_at, reason, status, video_room) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(doctor_id, patientId, scheduled.toISOString().slice(0, 19).replace('T', ' '), String(reason || ''), 'pending', newVideoRoom());
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(info.lastInsertRowid);
  const full = withNames(row);
  req.app.get('io')?.to(`user:${full.doctor_id}`).emit('appointment:new', full);
  req.app.get('io')?.to(`user:${full.patient_id}`).emit('appointment:new', full);
  res.status(201).json(full);
});

// Confirm / cancel / complete
router.patch('/appointments/:id', (req, res) => {
  const { id: me, role } = req.auth;
  const { status } = req.body || {};
  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(422).json({ message: 'Invalid status' });
  }
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Appointment not found' });
  if (row.doctor_id !== me && row.patient_id !== me) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (role === 'patient' && status === 'completed') {
    return res.status(403).json({ message: 'Only doctors can complete appointments' });
  }
  db.prepare("UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, row.id);
  const full = withNames(db.prepare('SELECT * FROM appointments WHERE id = ?').get(row.id));
  req.app.get('io')?.to(`user:${full.doctor_id}`).emit('appointment:updated', full);
  req.app.get('io')?.to(`user:${full.patient_id}`).emit('appointment:updated', full);
  res.json(full);
});

// Single appointment (participants only) — used by the video visit page
router.get('/appointments/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Appointment not found' });
  if (row.doctor_id !== req.auth.id && row.patient_id !== req.auth.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(withNames(row));
});

// Dashboard stats: real counts instead of hardcoded cards
router.get('/stats', (req, res) => {
  const { id } = req.auth;
  const upcoming = db
    .prepare(
      `SELECT COUNT(*) AS c FROM appointments
       WHERE (doctor_id = ? OR patient_id = ?) AND status IN ('pending','confirmed')
       AND datetime(scheduled_at) >= datetime('now')`
    )
    .get(id, id).c;
  const unread = db
    .prepare('SELECT COUNT(*) AS c FROM messages WHERE receiver_id = ? AND is_read = 0')
    .get(id).c;
  const next = db
    .prepare(
      `SELECT * FROM appointments WHERE (doctor_id = ? OR patient_id = ?) AND status IN ('pending','confirmed')
       AND datetime(scheduled_at) >= datetime('now') ORDER BY datetime(scheduled_at) ASC LIMIT 1`
    )
    .get(id, id);
  res.json({ upcoming, unread, next: next ? withNames(next) : null });
});

export default router;
