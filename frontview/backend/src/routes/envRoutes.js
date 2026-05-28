// routes/envRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { addEnvVar, getEnvVars, deleteEnvVar } = require('../controllers/envController');

router.route('/:id/env')
    .post(protect, addEnvVar)
    .get(protect, getEnvVars);

router.delete('/:id/env/:key', protect, deleteEnvVar);

module.exports = router;