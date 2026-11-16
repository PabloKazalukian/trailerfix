import { Router } from 'express';
import userContentController from '../controllers/userContent.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import authenticate from '../middlewares/authenticate.js';
import validateIdParams from '../middlewares/validateIdParams.js';
import {
  validateUserContentCreate,
  validateUserContentUpdate,
} from '../middlewares/validateUserContent.js';

const router = Router();

router.use(asyncHandler(authenticate));

router.get('/', asyncHandler(userContentController.list));
router.post(
  '/',
  validateUserContentCreate,
  asyncHandler(userContentController.create),
);
router.patch(
  '/:contentId',
  validateIdParams('contentId'),
  validateUserContentUpdate,
  asyncHandler(userContentController.update),
);
router.delete(
  '/:contentId',
  validateIdParams('contentId'),
  asyncHandler(userContentController.remove),
);

export default router;
