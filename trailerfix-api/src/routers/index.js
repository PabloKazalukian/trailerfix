import { Router } from 'express';
import { sequelize } from '../database/models/index.js';
import authRouter from './auth.router.js';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    return res.json({ status: 'ok', database: 'up' });
  } catch {
    return res.status(503).json({ status: 'error', database: 'down' });
  }
});

router.use('/auth', authRouter);

export default router;
