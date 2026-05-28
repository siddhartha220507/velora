const asyncHandler = require('../middlewares/asyncHandler');
const Project = require('../models/Project');
const Deployment = require('../models/Deployment');
const { executeDeployment, stopDeployment, executeRollback } = require('../services/deploymentService');

const formatAiResult = (result) => {
    if (typeof result === 'string') return result;
    if (result?.markdown) return result.markdown;

    let text = `### Root Cause Analysis\n${result?.rootCause || 'No specific root cause identified.'}\n\n`;

    if (Array.isArray(result?.stepByStepFix) && result.stepByStepFix.length > 0) {
        text += '### How to Fix\n';
        result.stepByStepFix.forEach((step, idx) => {
            text += `${idx + 1}. ${step}\n`;
        });
        text += '\n';
    }

    if (Array.isArray(result?.securityFlags) && result.securityFlags.length > 0) {
        text += '### Security Warnings\n';
        result.securityFlags.forEach((flag) => {
            text += `- ${flag}\n`;
        });
        text += '\n';
    }

    return text.trim();
};

// @desc    List deployments for a project
// @route   GET /api/deployments?projectId=
exports.listDeploymentsForProject = asyncHandler(async (req, res) => {
    const { projectId } = req.query;

    if (!projectId) {
        res.status(400);
        throw new Error('projectId query parameter is required');
    }

    const project = await Project.findOne({
        _id: projectId,
        owner: req.user.id,
        isDeleted: false
    });

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const deployments = await Deployment.find({ projectId: project._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit); // Removed logs exclusion for persistence 🚀

    const total = await Deployment.countDocuments({ projectId: project._id });

    res.status(200).json({
        success: true,
        count: deployments.length,
        data: deployments,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        }
    });
});

exports.rollbackDeployment = asyncHandler(async (req, res) => {
    const { id: projectId, version } = req.params;

    const project = await Project.findOne({ _id: projectId, owner: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const targetOldDeployment = await Deployment.findOne({
        projectId,
        version: parseInt(version, 10)
    });

    if (!targetOldDeployment) {
        return res.status(404).json({ message: `Version ${version} not found for this project.` });
    }

    if (project.activeDeploymentId) {
        await stopDeployment(project.activeDeploymentId);
    }

    const lastDeployment = await Deployment.findOne({ projectId }).sort({ version: -1 });
    const newVersion = lastDeployment ? lastDeployment.version + 1 : 1;

    const newRollbackDeployment = await Deployment.create({
        projectId,
        version: newVersion,
        userId: req.user.id,
        branch: targetOldDeployment.branch || 'main',
        status: 'rolling_back',
        logs: [`[INFO] Initiating rollback to version ${version}...`]
    });

    const io = req.app.get('io');
    executeRollback(newRollbackDeployment._id, targetOldDeployment._id, io);

    res.status(202).json({
        success: true,
        message: `Rollback to version ${version} initiated successfully.`,
        deploymentId: newRollbackDeployment._id,
        newVersion
    });
});

// @desc    Trigger a new deployment
// @route   POST /api/deployments
exports.triggerDeployment = asyncHandler(async (req, res) => {
    const { projectId } = req.body;

    if (!projectId) {
        res.status(400);
        throw new Error('Project ID is required');
    }

    const project = await Project.findOne({ _id: projectId, owner: req.user.id, isDeleted: false });
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const deployment = await Deployment.create({
        projectId: project._id,
        userId: req.user.id,
        branch: project.branch,
        status: 'queued',
        startedAt: new Date()
    });

    const io = req.app.get('io');
    executeDeployment(deployment._id, io).catch(console.error);

    res.status(202).json({
        success: true,
        deploymentId: deployment._id,
        message: 'Deployment triggered successfully.'
    });
});

// @desc    Get deployment status
// @route   GET /api/deployments/:id
exports.getDeploymentStatus = asyncHandler(async (req, res) => {
    const deployment = await Deployment.findOne({ _id: req.params.id, userId: req.user.id });

    if (!deployment) {
        res.status(404);
        throw new Error('Deployment not found');
    }

    res.status(200).json({
        success: true,
        data: deployment
    });
});

// @desc    Stop an active deployment
// @route   POST /api/deployments/:id/stop
exports.stopActiveDeployment = asyncHandler(async (req, res) => {
    const deploymentId = req.params.id;

    const deployment = await Deployment.findOne({ _id: deploymentId, userId: req.user.id });
    if (!deployment) {
        res.status(404);
        throw new Error('Deployment not found');
    }

    if (!['queued', 'building', 'running', 'rolling_back'].includes(deployment.status)) {
        return res.status(200).json({
            success: true,
            message: `Deployment is already ${deployment.status}`
        });
    }

    await stopDeployment(deploymentId);

    res.status(200).json({
        success: true,
        message: 'Deployment stopped successfully'
    });
});

// @desc    Analyze deployment logs with AI
// @route   POST /api/deployments/:id/analyze-logs
exports.analyzeLogs = asyncHandler(async (req, res) => {
    const deployment = await Deployment.findOne({ _id: req.params.id, userId: req.user.id });

    if (!deployment) {
        res.status(404);
        throw new Error('Deployment not found');
    }

    if (!deployment.logs || deployment.logs.length === 0) {
        res.status(400);
        throw new Error('No logs found for this deployment');
    }

    const provider = req.body.provider || 'mistral';
    const question = req.body.question || '';
    const { analyzeLogsWithAI } = require('../services/logAnalysisService');

    const analysisResult = await analyzeLogsWithAI(deployment.logs, provider, question);

    res.status(200).json({
        success: true,
        data: analysisResult
    });
});

// @desc    Stream AI analysis of deployment logs (SSE)
// @route   POST /api/deployments/:id/analyze/stream
// @access  Private
exports.analyzeLogsStream = async (req, res) => {
    try {
        const deployment = await Deployment.findOne({ _id: req.params.id, userId: req.user.id });

        if (!deployment) {
            return res.status(404).json({ message: 'Deployment not found' });
        }

        if (!deployment.logs || deployment.logs.length === 0) {
            return res.status(400).json({ message: 'No logs found for this deployment' });
        }

        const provider = req.body.provider || 'mistral';
        const question = req.body.question || '';

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        });

        const { analyzeLogsWithAI } = require('../services/logAnalysisService');
        res.write(`data: ${JSON.stringify({ text: `[AI model: ${String(provider).toUpperCase()}]\n\n` })}\n\n`);

        // 🌟 SSE Keep-Alive: Har 15 second mein ek heartbeat bhejte raho
        const keepAlive = setInterval(() => {
            res.write(':\n\n'); 
        }, 15000);

        try {
            const result = await analyzeLogsWithAI(deployment.logs, provider, question);
            const text = formatAiResult(result);
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
        } finally {
            clearInterval(keepAlive);
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('AI Global Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            res.write(`data: ${JSON.stringify({ text: '\n\n### AI Analysis Failed\nPlease retry or switch models.' })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        }
    }
};
