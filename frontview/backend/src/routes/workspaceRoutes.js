const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { verifyWorkspaceAccess, requireRole } = require('../middlewares/workspaceMiddleware');
const {
  getWorkspaceOverview,
  getWorkspaceMetrics,
  getWorkspaceEnvironments,
  getWorkspaceNotifications,
  getWorkspaceMembers,
  inviteWorkspaceMember,
  searchWorkspace,
  getUserWorkspaces,
  acceptWorkspaceInvite,
  removeWorkspaceMember
} = require('../controllers/workspaceController');

router.use(protect);

// Global Workspace routes (no specific workspace ID required)
router.get('/', getUserWorkspaces);
router.post('/members/accept-invite', acceptWorkspaceInvite);

// Workspace-specific routes (requires x-workspace-id header)
router.use(verifyWorkspaceAccess);

router.get('/overview', getWorkspaceOverview);
router.get('/metrics', getWorkspaceMetrics);
router.get('/environments', getWorkspaceEnvironments);
router.get('/notifications', getWorkspaceNotifications);
router.get('/members', getWorkspaceMembers);
router.post('/members/invite', requireRole('ADMIN'), inviteWorkspaceMember);
router.delete('/members/:id', requireRole('ADMIN'), removeWorkspaceMember);
router.get('/search', searchWorkspace);

module.exports = router;
