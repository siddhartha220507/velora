const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
    getProjectTeam, 
    inviteMember, 
    removeMember,
    acceptInvite
} = require('../controllers/teamController');

router.use(protect);

router.post('/accept-invite', acceptInvite);
router.get('/:projectId', getProjectTeam);
router.post('/:projectId/invite', inviteMember);
router.delete('/:projectId/members/:memberId', removeMember);

module.exports = router;
