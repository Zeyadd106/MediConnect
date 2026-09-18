import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db.js';
import { authRequired } from '../auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${path.extname(file.originalname || '')}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed (images, PDF, TXT, DOC/DOCX only)'));
  },
});

const router = express.Router();
router.use(authRequired);

export function attachmentJson(row) {
  if (!row) return null;
  return {
    id: row.id,
    original_name: row.original_name,
    mimetype: row.mimetype,
    size: row.size,
    url: `/api/files/${row.id}`,
  };
}

// Upload a file; returns attachment record. Client then sends a message with attachment_id.
router.post('/uploads', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(422).json({ message: err.message || 'Upload failed' });
    if (!req.file) return res.status(422).json({ message: 'No file provided' });
    const info = db
      .prepare(
        'INSERT INTO attachments (uploader_id, original_name, stored_name, mimetype, size) VALUES (?, ?, ?, ?, ?)'
      )
      .run(
        req.auth.id,
        req.file.originalname,
        req.file.filename,
        req.file.mimetype,
        req.file.size
      );
    const row = db.prepare('SELECT * FROM attachments WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(attachmentJson(row));
  });
});

// Download/stream a file. Only the uploader or participants of a linked message may access.
router.get('/files/:id', (req, res) => {
  const file = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id);
  if (!file) return res.status(404).json({ message: 'File not found' });

  const linked = db
    .prepare('SELECT sender_id, receiver_id FROM messages WHERE attachment_id = ? LIMIT 1')
    .get(file.id);
  const isParticipant =
    file.uploader_id === req.auth.id ||
    (linked && (linked.sender_id === req.auth.id || linked.receiver_id === req.auth.id));
  if (!isParticipant) return res.status(403).json({ message: 'Forbidden' });

  const abs = path.join(uploadDir, file.stored_name);
  if (!fs.existsSync(abs)) return res.status(404).json({ message: 'File missing from disk' });
  res.setHeader('Content-Type', file.mimetype);
  res.setHeader('Content-Disposition', `inline; filename="${file.original_name.replace(/"/g, '')}"`);
  fs.createReadStream(abs).pipe(res);
});

export default router;
