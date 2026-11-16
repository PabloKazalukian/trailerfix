import { Router } from 'express';
import { sequelize } from '../database/models/index.js';
import actorRouter from './actor.router.js';
import authRouter from './auth.router.js';
import contentRouter from './content.router.js';
import genreRouter from './genre.router.js';
import seasonRouter from './season.router.js';
import userContentRouter from './userContent.router.js';

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
router.use('/contents', contentRouter);
router.use('/genres', genreRouter);
router.use('/actors', actorRouter);
router.use('/series', seasonRouter);
router.use('/me/content', userContentRouter);

export default router;
