import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { mongoUri } from './config';
import authRoutes from './routes/auth';
import financeRoutes from './routes/finance';
import transfersRoutes from './routes/transfers';
import adminRoutes from './routes/admin';

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(mongoUri)
  .then(() => console.log('Подключено к MongoDB'))
  .catch((err) => console.error('Ошибка подключения к MongoDB:', err));

app.use('/api/auth', authRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/admin', adminRoutes);

const port = 3000;
app.listen(port, () => console.log(`Сервер запущен на порту ${port}`));
