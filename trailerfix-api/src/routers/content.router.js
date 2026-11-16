import { Router } from 'express';
import contentController from '../controllers/content.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import authenticate from '../middlewares/authenticate.js';
import optionalAuth from '../middlewares/optionalAuth.js';
import validateIdParams from '../middlewares/validateIdParams.js';
import {
  validateContentActorCreate,
  validateContentActorUpdate,
  validateContentActorsReplace,
  validateContentCreate,
  validateContentGenresReplace,
  validateContentUpdate,
} from '../middlewares/validateContent.js';

const router = Router();
const auth = asyncHandler(authenticate);
const optAuth = asyncHandler(optionalAuth);

router.get('/', optAuth, asyncHandler(contentController.list));
router.get('/:id', optAuth, validateIdParams('id'), asyncHandler(contentController.getById));
router.post('/', auth, validateContentCreate, asyncHandler(contentController.create));
router.patch(
  '/:id',
  auth,
  validateIdParams('id'),
  validateContentUpdate,
  asyncHandler(contentController.update),
);
router.delete(
  '/:id',
  auth,
  validateIdParams('id'),
  asyncHandler(contentController.remove),
);

router.put(
  '/:id/genres',
  auth,
  validateIdParams('id'),
  validateContentGenresReplace,
  asyncHandler(contentController.replaceGenres),
);
router.post(
  '/:id/genres/:genreId',
  auth,
  validateIdParams('id', 'genreId'),
  asyncHandler(contentController.addGenre),
);
router.delete(
  '/:id/genres/:genreId',
  auth,
  validateIdParams('id', 'genreId'),
  asyncHandler(contentController.removeGenre),
);

router.put(
  '/:id/actors',
  auth,
  validateIdParams('id'),
  validateContentActorsReplace,
  asyncHandler(contentController.replaceActors),
);
router.post(
  '/:id/actors',
  auth,
  validateIdParams('id'),
  validateContentActorCreate,
  asyncHandler(contentController.addActor),
);
router.patch(
  '/:id/actors/:actorId',
  auth,
  validateIdParams('id', 'actorId'),
  validateContentActorUpdate,
  asyncHandler(contentController.updateActor),
);
router.delete(
  '/:id/actors/:actorId',
  auth,
  validateIdParams('id', 'actorId'),
  asyncHandler(contentController.removeActor),
);

export default router;
