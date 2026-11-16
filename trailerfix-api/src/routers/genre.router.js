import { Router } from 'express';
import genreController from '../controllers/genre.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import authenticate from '../middlewares/authenticate.js';
import validateIdParams from '../middlewares/validateIdParams.js';
import {
  validateGenreCreate,
  validateGenreUpdate,
} from '../middlewares/validateGenre.js';

const router = Router();
const auth = asyncHandler(authenticate);

router.get('/', asyncHandler(genreController.list));
router.get(
  '/:id',
  validateIdParams('id'),
  asyncHandler(genreController.getById),
);
router.post('/', auth, validateGenreCreate, asyncHandler(genreController.create));
router.patch(
  '/:id',
  auth,
  validateIdParams('id'),
  validateGenreUpdate,
  asyncHandler(genreController.update),
);
router.delete(
  '/:id',
  auth,
  validateIdParams('id'),
  asyncHandler(genreController.remove),
);

export default router;
