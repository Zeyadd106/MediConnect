# MediCare Chat — React + Node + Tailwind

Doctor-patient chat app rebuilt with **only**:

- **React.js** (Vite + React Router) — `client/`
- **Node.js** (Express + SQLite via `node:sqlite` + JWT) — `server/`
- **Tailwind CSS v4** — styling

## Structure

```text
client/          React frontend (port 3000, proxies /api + /socket.io → :5000)
  src/pages/     Home, Login, Register, Dashboards, Chats, Appointments
  src/components/ Sidebar, ChatInterface (Socket.IO realtime)
  src/lib/api.js  API helpers (JWT in localStorage)
  src/lib/socket.js  Socket.IO singleton (Bearer token auth)
  src/hooks/useAuth.js
server/          Node API + realtime (port 5000)
  index.js       Express + Socket.IO
  socket.js      JWT socket auth, user:{id} rooms, typing, presence
  db.js          SQLite init + seed (node:sqlite, no native deps)
  auth.js        JWT sign / verify
  routes/        auth, users, messages, appointments
```

## Requirements (Windows 11)

- Node.js 22+ (uses built-in `node:sqlite`) + npm
- No PHP / Composer / MySQL needed

## Setup

```powershell
cd "C:\Users\zeyad\Documents\GitHub\medicare chat"
npm --prefix server install
npm --prefix client install
Copy-Item server\.env.example server\.env
```

## Run (2 terminals or one)

```powershell
# Terminal 1 — API
cd "C:\Users\zeyad\Documents\GitHub\medicare chat\server"
npm run dev   # http://127.0.0.1:5000

# Terminal 2 — Web
cd "C:\Users\zeyad\Documents\GitHub\medicare chat\client"
npm run dev   # http://127.0.0.1:3000
```

Or from repo root (needs `concurrently`):

```powershell
cd "C:\Users\zeyad\Documents\GitHub\medicare chat"
npm install
npm run dev
```

Production web build:

```powershell
cd "C:\Users\zeyad\Documents\GitHub\medicare chat"
npm run build
```

## Verify

- Web: `http://127.0.0.1:3000/`
- API health: `http://127.0.0.1:5000/api/health`

Demo accounts (password: `password`):

- Doctor: `doctor@example.com`, `sarah@example.com`
- Patient: `patient@example.com`, `robert@example.com`

## API

- `POST /api/register` { name, email, password, role }
- `POST /api/login` { email, password } → { token, user }
- `GET /api/user` (Bearer)
- `POST /api/logout` (Bearer)
- `GET /api/doctors?search=` (Bearer)
- `GET /api/patients?search=` (Bearer)
- `GET /api/messages/:partnerId?` (Bearer)
- `POST /api/messages` { content, receiver_id } (Bearer) → emits `message:new` to both users
- `PATCH /api/messages/read` { partner_id } (Bearer)
- `GET /api/unread-count` (Bearer) → { total, bySender }
- `GET /api/chat-partners` (Bearer)
- `GET /api/appointments` (Bearer, mine)
- `GET /api/appointments/:id` (Bearer, participants only, includes `video_room`)
- `POST /api/appointments` { doctor_id, scheduled_at, reason } (Bearer)
- `PATCH /api/appointments/:id` { status: confirmed|cancelled|completed } (Bearer)
- `GET /api/stats` (Bearer) → { upcoming, unread, next }
- `POST /api/uploads` (Bearer, multipart `file`: images/PDF/TXT/DOC/DOCX, max 10 MB) → attachment
- `GET /api/files/:id` (Bearer, uploader or message participants only)

## Realtime (Socket.IO)

- Auth via `auth: { token }` handshake, room `user:{id}`
- Server emits: `message:new`, `message:read`, `typing:start`/`typing:stop`, `presence:update`, `appointment:new`/`appointment:updated`
- Chat shows online dots, typing indicator, per-user unread badges, instant delivery (no polling)

## Video visits (Jitsi, free, no keys)

- Every appointment gets a unique `video_room` (e.g. `medicare-xxxxxxxx`)
- Join via `Join Video` on appointment cards → `/doctor|patient/appointments/:id/video`
- Embedded Jitsi Meet (`meet.jit.si`) with prejoin screen; only participants can load the room id
