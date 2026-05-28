const Integration = require('../models/Integration');
const Project = require('../models/Project');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all integrations for a project
// @route   GET /api/projects/:projectId/integrations
// @access  Private
exports.getProjectIntegrations = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, owner: req.user.id });
    if (!project) {
        res.status(404);
        throw new Error('Project not found or unauthorized');
    }

    const integrations = await Integration.find({ projectId, isActive: true });

    res.status(200).json({
        success: true,
        count: integrations.length,
        data: integrations
    });
});

// @desc    Connect a new integration
// @route   POST /api/projects/:projectId/integrations
// @access  Private
exports.connectIntegration = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { provider, type, config } = req.body;

    if (!provider || !config) {
        res.status(400);
        throw new Error('Provider and config are required');
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, owner: req.user.id });
    if (!project) {
        res.status(404);
        throw new Error('Project not found or unauthorized');
    }

    // Check if integration already exists (optional: update instead of create)
    let integration = await Integration.findOne({ projectId, provider });

    if (integration) {
        integration.config = config;
        integration.isActive = true;
        await integration.save();
    } else {
        integration = await Integration.create({
            projectId,
            provider,
            type: type || 'notification', // Default to notification
            config
        });
    }

    res.status(201).json({
        success: true,
        data: integration
    });
});

// @desc    Disconnect integration
// @route   DELETE /api/projects/:projectId/integrations/:integrationId
// @access  Private
exports.disconnectIntegration = asyncHandler(async (req, res) => {
    const { projectId, integrationId } = req.params;

    // Verify project ownership first
    const project = await Project.findOne({ _id: projectId, owner: req.user.id });
    if (!project) {
        res.status(404);
        throw new Error('Project not found or unauthorized');
    }

    const integration = await Integration.findOneAndDelete({ _id: integrationId, projectId });

    if (!integration) {
        res.status(404);
        throw new Error('Integration not found');
    }

    res.status(200).json({
        success: true,
        message: 'Integration disconnected'
    });
});
