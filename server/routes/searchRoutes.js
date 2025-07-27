// server/routes/searchRoutes.js (Corrected with ES Modules)
import express from 'express';
import * as searchController from '../controllers/searchController.js';

const router = express.Router();

// This route handles general text-based searches (e.g., from the navbar)
router.get('/', searchController.globalSearch);

// This route handles proximity searches for the map feature
router.get('/nearby', searchController.searchNearby);

export default router;
