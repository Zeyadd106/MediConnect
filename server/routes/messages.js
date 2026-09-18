import express from 'express';
import { db, publicUser } from '../db.js';
import { authRequired } from '../auth.js';
import { attachmentJson } from './files.js';

const router = express.Router();
router.use(authRequired);

function withAttachment(msg) {
  if (!msg) return msg;
  const att = msg.attachment_id
    ? db.prepare('SELECT * FROM attachments WHERE id = ?').get(msg.attachment_id)
    : null;
  return { ...msg, attachment: attachmentJson(att) };
}

router.get('/messages/:partnerId?', (req, res) => {
  const { partnerId } = req.params;
  if (!partnerId) return res.json([]);
  const rows = db
    .prepare(
      `SELECT * FROM messages
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY datetime(created_at) ASC, id ASC`
    )
    .all(req.auth.id, partnerId, partnerId, req.auth.id);
  res.json(rows.map(withAttachment));
});

router.post('/messages', (req, res) => {
  const { content, receiver_id, attachment_id } = req.body || {};
  if (!content || !receiver_id) {
    return res.status(422).json({ message: 'content and receiver_id are required' });
  }
  const receiver = db.prepare('SELECT * FROM users WHERE id = ?').get(receiver_id);
  if (!receiver) return res.status(422).json({ message: 'Receiver not found' });
  if (Number(receiver_id) === Number(req.auth.id)) {
    return res.status(422).json({ message: 'Cannot message yourself' });
  }
  let attId = null;
  if (attachment_id) {
    const att = db.prepare('SELECT * FROM attachments WHERE id = ?').get(attachment_id);
    if (!att || att.uploader_id !== req.auth.id) {
      return res.status(422).json({ message: 'Invalid attachment' });
    }
    attId = att.id;
  }
  const info = db
    .prepare('INSERT INTO messages (sender_id, receiver_id, content, is_read, attachment_id) VALUES (?, ?, ?, 0, ?)')
    .run(req.auth.id, receiver_id, String(content), attId);
  const msg = withAttachment(db.prepare('SELECT * FROM messages WHERE id = ?').get(info.lastInsertRowid));
  const io = req.app.get('io');
  io?.to(`user:${msg.receiver_id}`).emit('message:new', msg);
  io?.to(`user:${msg.sender_id}`).emit('message:new', msg);
  res.status(201).json(msg);
});

// Mark a conversation as read
router.patch('/messages/read', (req, res) => {
  const { partner_id } = req.body || {};
  if (!partner_id) return res.status(422).json({ message: 'partner_id is required' });
  db.prepare('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?')
    .run(partner_id, req.auth.id);
  req.app.get('io')?.to(`user:${partner_id}`).emit('message:read', { by: req.auth.id });
  res.json({ ok: true });
});

// Unread counts: total + per-sender breakdown
router.get('/unread-count', (req, res) => {
  const total = db
    .prepare('SELECT COUNT(*) AS c FROM messages WHERE receiver_id = ? AND is_read = 0')
    .get(req.auth.id).c;
  const bySender = db
    .prepare(
      'SELECT sender_id AS id, COUNT(*) AS count FROM messages WHERE receiver_id = ? AND is_read = 0 GROUP BY sender_id'
    )
    .all(req.auth.id);
  res.json({ total, bySender });
});

router.get('/chat-partners', (req, res) => {
  const me = db.prepare('SELECT * FROM users WHERE id = ?').get(req.auth.id);
  const targetRole = me.role === 'doctor' ? 'patient' : 'doctor';
  const ids = db
    .prepare(
      `SELECT DISTINCT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS pid
       FROM messages WHERE sender_id = ? OR receiver_id = ?`
    )
    .all(req.auth.id, req.auth.id, req.auth.id)
    .map((r) => r.pid);
  if (ids.length === 0) return res.json([]);
  const placeholders = ids.map(() => '?').join(',');
  const rows = db
    .prepare(`SELECT * FROM users WHERE id IN (${placeholders}) AND role = ?`)
    .all(...ids, targetRole)
    .map(publicUser);
  res.json(rows);
});

export default router;
