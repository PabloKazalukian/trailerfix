import { Router } from 'express';
import seasonController from '../controllers/season.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import authenticate from '../middlewares/authenticate.js';
import validateIdParams from '../middlewares/validateIdParams.js';
import {
  validateSeasonCreate,
  validateSeasonUpdate,
} from '../middlewares/validateSeason.js';

const router = Router();
const auth = asyncHandler(authenticate);

router.get(
  '/:contentId/seasons',
  validateIdParams('contentId'),
  asyncHandler(seasonController.list),
);
router.post(
  '/:contentId/seasons',
  auth,
  validateIdParams('contentId'),
  validateSeasonCreate,
  asyncHandler(seasonController.create),
);
router.patch(
  '/:contentId/seasons/:seasonId',
  auth,
  validateIdParams('contentId', 'seasonId'),
  validateSeasonUpdate,
  asyncHandler(seasonController.update),
);
router.delete(
  '/:contentId/seasons/:seasonId',
  auth,
  validateIdParams('contentId', 'seasonId'),
  asyncHandler(seasonController.remove),
);

export default router;
