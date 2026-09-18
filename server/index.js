import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import appointmentRoutes from './routes/appointments.js';
import fileRoutes from './routes/files.js';
import { initSocket } from './socket.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', messageRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', fileRoutes);

app.use((req, res) => res.status(404).json({ message: 'Not found' }));

const httpServer = http.createServer(app);
const io = initSocket(httpServer);
app.set('io', io);

httpServer.listen(PORT, '127.0.0.1', () => {
  console.log(`MediCare API + realtime listening on http://127.0.0.1:${PORT}`);
});
