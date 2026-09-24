import { Router } from 'express';
import * as donorController from '../controllers/donor.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { availabilitySchema, locationSchema, fcmTokenSchema } from '../validators/donor.schema';

const router = Router();

// All donor routes require authentication
router.use(authMiddleware);

router.patch('/availability', validate(availabilitySchema), donorController.toggleAvailability);
router.patch('/location', validate(locationSchema), donorController.updateLocation);
router.patch('/fcm-token', validate(fcmTokenSchema), donorController.updateFcmToken);

export default router;
