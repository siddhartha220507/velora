// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const {
    getUserRepos,
    createProject,
    getUserProjects,
    getProjectById,
    updateProject,
    getDashboardStats,
    deleteProject,
    createProjectFromFolder
} = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');
const { verifyWorkspaceAccess, requireRole } = require('../middlewares/workspaceMiddleware');
const { rollbackDeployment } =require('../controllers/deploymentController');

// Sabhi routes protected hain (JWT Token zaroori hai)
router.use(protect);
router.use(verifyWorkspaceAccess);

// Repos list (GitHub se real-time)
router.get('/repos', getUserRepos);
router.get('/stats', getDashboardStats);

// Projects CRUD (Database se)
router.route('/')
    .get(getUserProjects)
    .post(requireRole('ADMIN', 'DEVELOPER'), createProject);

router.post('/upload', requireRole('ADMIN', 'DEVELOPER'), createProjectFromFolder);

router.route('/:id')
    .get(getProjectById)
    .put(requireRole('ADMIN', 'DEVELOPER'), updateProject)
    .delete(requireRole('ADMIN'), deleteProject);

router.post('/:id/rollback/:version', requireRole('ADMIN', 'DEVELOPER'), rollbackDeployment);
router.post('/:id/deploy', requireRole('ADMIN', 'DEVELOPER'), require('../controllers/projectController').deployProject);

module.exports = router;