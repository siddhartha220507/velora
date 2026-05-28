const asyncHandler = require('./asyncHandler');
const WorkspaceInvite = require('../models/WorkspaceInvite');

exports.verifyWorkspaceAccess = asyncHandler(async (req, res, next) => {
    // 1. Get workspace ID from headers (default to current user if not provided)
    const workspaceId = req.headers['x-workspace-id'] || req.user.id;

    // 2. Personal Workspace Check
    if (workspaceId === req.user.id) {
        req.workspaceId = req.user.id;
        req.workspaceRole = 'OWNER';
        return next();
    }

    // 3. Team Workspace Check
    const invite = await WorkspaceInvite.findOne({
        owner: workspaceId,
        userId: req.user.id,
        status: 'ACTIVE'
    });

    if (!invite) {
        res.status(403);
        throw new Error('You do not have access to this workspace.');
    }

    req.workspaceId = workspaceId;
    req.workspaceRole = invite.role;
    next();
});

exports.requireRole = (...roles) => {
    return (req, res, next) => {
        // OWNER always has full access
        if (req.workspaceRole === 'OWNER') {
            return next();
        }
        
        if (!roles.includes(req.workspaceRole)) {
            res.status(403);
            throw new Error('You do not have permission to perform this action.');
        }
        next();
    };
};
