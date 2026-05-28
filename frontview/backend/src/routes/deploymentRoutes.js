// routes/deploymentRoutes.js
const express = require('express');
const router = express.Router();
const {
    triggerDeployment,
    getDeploymentStatus,
    stopActiveDeployment,
    analyzeLogs,
    analyzeLogsStream,
    listDeploymentsForProject
} = require('../controllers/deploymentController');
const { protect } = require('../middlewares/authMiddleware');
const { rollbackDeployment } = require('../controllers/deploymentController');

// Sabhi deployment actions protected hone chahiye
router.use(protect);

router.get('/', listDeploymentsForProject);
router.post('/', triggerDeployment);
router.get('/:id', getDeploymentStatus);
router.post('/:id/stop', stopActiveDeployment);
router.post('/:id/analyze-logs', analyzeLogs);
router.post('/:id/analyze/stream', analyzeLogsStream);  // SSE streaming AI
router.post('/:id/rollback/:version', protect, rollbackDeployment);

module.exports = router;
