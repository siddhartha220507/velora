// controllers/projectController.js
const Project = require('../models/Project');
const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/User');
const { fetchUserRepos } = require('../services/repoService');

// @desc    Get user's GitHub repositories
// @route   GET /api/projects/repos
exports.getUserRepos = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';

    const user = await User.findById(userId).select('+githubAccessToken');
    if (!user || !user.githubAccessToken) {
        // Return 400 instead of 401 to prevent global auth interceptor from redirecting
        return res.status(400).json({ 
            success: false, 
            message: 'GitHub account not linked. Please connect your GitHub account to import repositories.' 
        });
    }

    let repos = await fetchUserRepos(user.githubAccessToken);
    if (searchQuery) {
        repos = repos.filter(repo => repo.name.toLowerCase().includes(searchQuery));
    }

    res.status(200).json({ success: true, count: repos.length, repos });
});

// @desc    Naya Project create karna (Save to DB)
// @route   POST /api/projects
exports.createProject = asyncHandler(async (req, res) => {
    const { name, repoUrl, repoName, branch, installCommand, startCommand, framework } = req.body;

    if (!name || !repoUrl || !repoName) {
        res.status(400);
        throw new Error('Please provide name, repoUrl, and repoName');
    }

    // 2. Check for duplicate project (same repo for same user)
    // IMPORTANT: Since we are switching to hard delete, we only check active ones.
    const existingProject = await Project.findOne({ 
        repoUrl: repoUrl.trim(), 
        owner: req.workspaceId 
    });

    if (existingProject) {
        // If it exists, it's a conflict because we use hard delete now
        res.status(400);
        throw new Error('You have already added this repository as a project.');
    }

    // 3. Create Project
    try {
        const project = await Project.create({
            name,
            repoUrl,
            repoName,
            branch: branch || 'main',
            owner: req.workspaceId,
            installCommand: installCommand || 'npm install',
            startCommand: startCommand || 'npm start',
            framework: framework || 'other'
        });

        // 🌟 AUTO-TRIGGER FIRST DEPLOYMENT
        const Deployment = require('../models/Deployment');
        const { executeDeployment } = require('../services/deploymentService');
        
        const deployment = await Deployment.create({
            projectId: project._id,
            userId: req.user.id,
            branch: project.branch,
            status: 'queued',
            startedAt: new Date()
        });

        const io = req.app.get('io');
        executeDeployment(deployment._id, io).catch(console.error);

        res.status(201).json({ 
            success: true, 
            data: project,
            deploymentId: deployment._id 
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            throw new Error('This repository has already been deployed as a project in your account. Please use the existing project or delete it first.');
        }
        throw error;
    }
});

// @desc    User ke saare active projects lana
exports.getUserProjects = asyncHandler(async (req, res) => {
    const workspaceOwnerId = req.workspaceId;
    
    // Using Aggregation to fetch projects and their LATEST deployment in ONE query 🚀
    const projectsWithDeployment = await Project.aggregate([
        { 
            $match: { 
                owner: new (require('mongoose').Types.ObjectId)(workspaceOwnerId), 
                isDeleted: false 
            } 
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: 'deployments',
                let: { pid: '$_id' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$projectId', '$$pid'] } } },
                    { $sort: { createdAt: -1 } },
                    { $limit: 1 }
                ],
                as: 'latestDeployment'
            }
        },
        {
            $addFields: {
                latestDeployment: { $arrayElemAt: ['$latestDeployment', 0] }
            }
        }
    ]);

    res.status(200).json({ 
        success: true, 
        count: projectsWithDeployment.length, 
        data: projectsWithDeployment 
    });
});

// @desc    Single project detail lana
// @route   GET /api/projects/:id
exports.getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findOne({ 
        _id: req.params.id, 
        owner: req.workspaceId 
    });

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    res.status(200).json({ success: true, data: project });
});

// @desc    Update project detail
// @route   PUT /api/projects/:id
exports.updateProject = asyncHandler(async (req, res) => {
    let project = await Project.findOne({ 
        _id: req.params.id, 
        owner: req.workspaceId 
    });

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: project });
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
    const workspaceOwnerId = req.workspaceId;
    const mongoose = require('mongoose');
    const Project = require('../models/Project');
    const Deployment = require('../models/Deployment');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get all project IDs in this workspace to fetch related deployments
    const projects = await Project.find({ owner: workspaceOwnerId, isDeleted: false }).select('_id');
    const projectIds = projects.map(p => p._id);

    // 🚀 Parallel Execution for speed
    const [counts, activityData] = await Promise.all([
        // 1. Projects and Deployments Stats
        Project.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(workspaceOwnerId), isDeleted: false } },
            {
                $lookup: {
                    from: 'deployments',
                    localField: '_id',
                    foreignField: 'projectId',
                    as: 'deployments'
                }
            },
            {
                $group: {
                    _id: null,
                    totalProjects: { $sum: 1 },
                    totalDeployments: { $sum: { $size: '$deployments' } },
                    successCount: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: '$deployments',
                                    as: 'd',
                                    cond: { $eq: ['$$d.status', 'running'] } // Adjusted to 'running' based on your previous logic
                                }
                            }
                        }
                    }
                }
            }
        ]),
        // 2. Activity Data (Filtered by Projects in workspace, not triggering user)
        Deployment.aggregate([
            {
                $match: {
                    projectId: { $in: projectIds },
                    createdAt: { $gt: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ])
    ]);

    const statsResult = counts[0] || { totalProjects: 0, totalDeployments: 0, successCount: 0 };
    const successRate = statsResult.totalDeployments > 0 
        ? ((statsResult.successCount / statsResult.totalDeployments) * 100).toFixed(1) 
        : "0";

    // Build activity bars
    const activityBars = [];
    const dateMap = new Map(activityData.map(d => [d._id, d.count]));
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        activityBars.push(dateMap.get(dateStr) || 0);
    }

    res.status(200).json({
        success: true,
        stats: {
            totalProjects: statsResult.totalProjects,
            totalDeployments: statsResult.totalDeployments,
            successRate: successRate + "%",
            avgBuildTime: "42s",
            activityBars
        }
    });
});

// @desc    Project delete karna (Hard Delete)
// @route   DELETE /api/projects/:id
exports.deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findOne({ 
        _id: req.params.id, 
        owner: req.workspaceId 
    });

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Hard delete logic: remove from DB
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Project removed permanently' });
});

// @desc    Trigger a new deployment for an existing project
// @route   POST /api/projects/:id/deploy
exports.deployProject = asyncHandler(async (req, res) => {
    console.log(`🚀 Manual deployment triggered for project: ${req.params.id}`);
    const project = await Project.findOne({ 
        _id: req.params.id, 
        owner: req.workspaceId 
    });

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const Deployment = require('../models/Deployment');
    const { executeDeployment } = require('../services/deploymentService');
    
    const deployment = await Deployment.create({
        projectId: project._id,
        userId: req.user._id,
        branch: project.branch || 'main',
        status: 'queued',
        startedAt: new Date()
    });

    const io = req.app.get('io');
    executeDeployment(deployment._id, io).catch(err => {
        console.error(`❌ Deployment execution failed for ${deployment._id}:`, err);
    });

    console.log(`✅ Deployment ${deployment._id} queued successfully`);
    res.status(201).json({ 
        success: true, 
        deploymentId: deployment._id 
    });
});

// @desc    Folder upload se project create karna
// @route   POST /api/projects/upload
exports.createProjectFromFolder = asyncHandler(async (req, res) => {
    const { name, files, framework, installCommand, startCommand } = req.body;

    if (!name || !files || !Array.isArray(files)) {
        res.status(400);
        throw new Error('Please provide project name and files');
    }

    // 1. Create Project Record in DB
    const project = await Project.create({
        name,
        repoName: `upload/${name}`, // Placeholder for uploaded projects
        deploymentSource: 'upload',
        owner: req.workspaceId,
        framework: framework || 'other',
        installCommand: installCommand || 'npm install',
        startCommand: startCommand || 'npm start'
    });

    // 2. Create Initial Deployment Record
    const Deployment = require('../models/Deployment');
    const { executeDeployment } = require('../services/deploymentService');
    const { writeProjectFiles } = require('../services/fsManager');
    
    const deployment = await Deployment.create({
        projectId: project._id,
        userId: req.user.id,
        status: 'queued',
        startedAt: new Date()
    });

    // 3. Physical files ko disk pe likho (build hone se pehle)
    await writeProjectFiles(deployment._id.toString(), files);

    // 🌟 APPROACH 2: Cloudflare R2 Upload (Persistence)
    // Hum files ko async upload karte hain taaki deployment delay na ho
    const { uploadProjectFolder } = require('../services/storageService');
    uploadProjectFolder(deployment._id.toString(), files).catch(err => {
        console.error(`❌ Cloudflare R2 Backup Failed: ${err.message}`);
    });

    // 4. Deployment Engine ko trigger karo
    const io = req.app.get('io');
    executeDeployment(deployment._id, io).catch(err => {
        console.error(`❌ Upload-based deployment failed for ${deployment._id}:`, err);
    });

    res.status(201).json({ 
        success: true, 
        data: project,
        deploymentId: deployment._id 
    });
});