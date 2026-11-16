import { Router } from 'express';
import actorController from '../controllers/actor.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import authenticate from '../middlewares/authenticate.js';
import validateIdParams from '../middlewares/validateIdParams.js';
import {
  validateActorCreate,
  validateActorUpdate,
} from '../middlewares/validateActor.js';

const router = Router();
const auth = asyncHandler(authenticate);

router.get('/', asyncHandler(actorController.list));
router.get(
  '/:id',
  validateIdParams('id'),
  asyncHandler(actorController.getById),
);
router.post('/', auth, validateActorCreate, asyncHandler(actorController.create));
router.patch(
  '/:id',
  auth,
  validateIdParams('id'),
  validateActorUpdate,
  asyncHandler(actorController.update),
);
router.delete(
  '/:id',
  auth,
  validateIdParams('id'),
  asyncHandler(actorController.remove),
);

export default router;
