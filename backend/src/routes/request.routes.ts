import { Router } from 'express';
import * as requestController from '../controllers/request.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createRequestSchema,
  acceptRequestSchema,
  proxySchema,
  updateStatusSchema,
} from '../validators/request.schema';

const router = Router();

// All request routes require authentication
router.use(authMiddleware);

router.post('/', validate(createRequestSchema), requestController.createRequest);
router.get('/history', requestController.getHistory);
router.get('/:id', requestController.getRequest);
router.post('/:id/accept', validate(acceptRequestSchema), requestController.acceptRequest);
router.post('/:id/proxy', validate(proxySchema), requestController.submitProxy);
router.post('/:id/decline', requestController.declineRequest);
router.patch('/:id/status', validate(updateStatusSchema), requestController.updateStatus);
router.post('/:id/complete', requestController.completeRequest);

export default router;
