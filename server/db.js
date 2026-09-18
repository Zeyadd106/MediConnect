import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
export const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('doctor','patient')),
  avatar TEXT,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at DATETIME NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','cancelled','completed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uploader_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  mimetype TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// Lightweight migrations for DBs created before newer columns existed
try {
  db.exec('ALTER TABLE messages ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0;');
} catch {
  // column already exists
}
try {
  db.exec('ALTER TABLE messages ADD COLUMN attachment_id INTEGER REFERENCES attachments(id) ON DELETE SET NULL;');
} catch {
  // column already exists
}
try {
  db.exec('ALTER TABLE appointments ADD COLUMN video_room TEXT;');
} catch {
  // column already exists
}

function seed() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (count === 0) {

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password, role, avatar, details) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const pw = bcrypt.hashSync('password', 10);

  const drJohn = Number(insertUser.run(
    'Dr. John Smith', 'doctor@example.com', pw, 'doctor',
    '/placeholder.svg', 'Cardiologist, 10 years experience'
  ).lastInsertRowid);
  const drSarah = Number(insertUser.run(
    'Dr. Sarah Johnson', 'sarah@example.com', pw, 'doctor',
    '/placeholder.svg', 'Neurologist, 8 years experience'
  ).lastInsertRowid);
  const jane = Number(insertUser.run(
    'Jane Doe', 'patient@example.com', pw, 'patient',
    '/placeholder.svg', 'Age: 35, Last visit: 2 weeks ago'
  ).lastInsertRowid);
  const robert = Number(insertUser.run(
    'Robert Brown', 'robert@example.com', pw, 'patient',
    '/placeholder.svg', 'Age: 52, Last visit: 3 days ago'
  ).lastInsertRowid);

  const insertMsg = db.prepare(
    'INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?)'
  );
  const now = Date.now();
  const d = (ms) => new Date(now - ms).toISOString().slice(0, 19).replace('T', ' ');
  insertMsg.run(drJohn, jane, 'Hello Jane, how are you feeling today?', d(2 * 86400000));
  insertMsg.run(jane, drJohn, "I'm feeling much better, thank you doctor.", d(2 * 86400000 - 5 * 60000));
  insertMsg.run(drJohn, jane, 'Great to hear! Have you been taking your medication regularly?', d(2 * 86400000 - 7 * 60000));
  insertMsg.run(jane, drJohn, "Yes, I've been following your instructions carefully.", d(2 * 86400000 - 10 * 60000));
  insertMsg.run(drSarah, robert, "Hello Robert, I've reviewed your latest test results.", d(86400000));
  insertMsg.run(robert, drSarah, 'Thank you, Dr. Johnson. What do they show?', d(86400000 - 15 * 60000));
  insertMsg.run(drSarah, robert, 'Everything looks good. Your blood pressure has improved significantly.', d(86400000 - 20 * 60000));

  console.log('Seeded demo users + messages');
  } // end fresh-user seed

  // Appointment seed runs independently so existing DBs get it too
  const apptCount = db.prepare('SELECT COUNT(*) AS c FROM appointments').get().c;
  if (apptCount === 0) {
    const drJohnRow = db.prepare('SELECT id FROM users WHERE email = ?').get('doctor@example.com');
    const drSarahRow = db.prepare('SELECT id FROM users WHERE email = ?').get('sarah@example.com');
    const janeRow = db.prepare('SELECT id FROM users WHERE email = ?').get('patient@example.com');
    const robertRow = db.prepare('SELECT id FROM users WHERE email = ?').get('robert@example.com');
    if (drJohnRow && drSarahRow && janeRow && robertRow) {
      const now2 = Date.now();
      const insertAppt = db.prepare(
        'INSERT INTO appointments (doctor_id, patient_id, scheduled_at, reason, status, video_room) VALUES (?, ?, ?, ?, ?, ?)'
      );
      const soon = (days, hour) => {
        const dt = new Date(now2 + days * 86400000);
        dt.setHours(hour, 30, 0, 0);
        return dt.toISOString().slice(0, 19).replace('T', ' ');
      };
      insertAppt.run(drJohnRow.id, janeRow.id, soon(2, 14), 'Follow-up checkup', 'confirmed', newVideoRoom());
      insertAppt.run(drSarahRow.id, robertRow.id, soon(5, 10), 'Neurology consultation', 'pending', newVideoRoom());
      console.log('Seeded demo appointments');
    }
  }

  // Backfill video rooms for appointments created before the column existed
  try {
    const missing = db.prepare("SELECT id FROM appointments WHERE video_room IS NULL OR video_room = ''").all();
    const fix = db.prepare('UPDATE appointments SET video_room = ? WHERE id = ?');
    for (const row of missing) fix.run(newVideoRoom(), row.id);
    if (missing.length > 0) console.log(`Backfilled ${missing.length} video room(s)`);
  } catch {
    // ignore
  }
}

seed();

export function newVideoRoom() {
  const rand = Math.random().toString(36).slice(2, 10).replace(/[^a-z0-9]/gi, '').toLowerCase().padEnd(8, 'x');
  return `medicare-${rand}`;
}

export function publicUser(row) {
  if (!row) return null;
  const { password, ...rest } = row;
  return rest;
}
