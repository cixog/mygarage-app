// server/routes/vehicleRoutes.js (Corrected with ES Modules)
import express from 'express';
// --- All imports must use the .js extension ---
import * as vehicleController from '../controllers/vehicleController.js';
import * as authController from '../controllers/authController.js';
import * as photoController from '../controllers/photoController.js';
import commentRouter from './commentRoutes.js';

const router = express.Router();

router.use('/:vehicleId/comments', commentRouter);

router.get('/:id', vehicleController.getVehicle);

router.use(authController.protect);

router
  .route('/')
  .get(vehicleController.getAllVehicles)
  .post(
    photoController.uploadUserPhoto,
    photoController.resizeUserPhoto,
    vehicleController.createVehicle
  );

router.patch('/:id/set-cover', vehicleController.setVehicleCoverPhoto);
router.patch('/:id/like', vehicleController.toggleLike);

router
  .route('/:id')
  .patch(vehicleController.updateVehicle)
  .delete(vehicleController.deleteVehicle);

export default router;
