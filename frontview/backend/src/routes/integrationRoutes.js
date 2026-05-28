const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middlewares/authMiddleware');
const {
    getProjectIntegrations,
    connectIntegration,
    disconnectIntegration
} = require('../controllers/integrationController');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getProjectIntegrations)
    .post(connectIntegration);

router.route('/:integrationId')
    .delete(disconnectIntegration);

module.exports = router;
