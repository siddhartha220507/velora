const mongoose = require('mongoose');
const asyncHandler = require('../middlewares/asyncHandler');
const Project = require('../models/Project');
const Deployment = require('../models/Deployment');
const User = require('../models/User');
const WorkspaceInvite = require('../models/WorkspaceInvite');
const { sendEmail } = require('../services/emailService');
const crypto = require('crypto');

const successStatuses = ['running', 'stopped'];
const terminalStatuses = ['running', 'stopped', 'failed'];
const DAY_MS = 24 * 60 * 60 * 1000;

function formatDuration(ms) {
  if (!ms || Number.isNaN(ms) || ms <= 0) return '0s';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function getDeploymentDurationMs(deployment) {
  if (typeof deployment.buildDuration === 'number' && deployment.buildDuration > 0) {
    return deployment.buildDuration;
  }

  if (deployment.startedAt && deployment.completedAt) {
    return new Date(deployment.completedAt).getTime() - new Date(deployment.startedAt).getTime();
  }

  return 0;
}

function deploymentStatusLabel(status) {
  const map = {
    queued: 'Queued',
    building: 'Building',
    running: 'Running',
    failed: 'Failed',
    stopped: 'Stopped',
    rolling_back: 'Rolling Back'
  };
  return map[status] || status;
}

function projectStatusFromDeployment(activeDeployment) {
  if (!activeDeployment) return 'INACTIVE';
  if (activeDeployment.status === 'running') return 'RUNNING';
  if (activeDeployment.status === 'building' || activeDeployment.status === 'queued') return 'BUILDING';
  if (activeDeployment.status === 'failed') return 'FAILED';
  return 'INACTIVE';
}

async function getOwnedProjectIds(userId) {
  const projects = await Project.find({ owner: userId, isDeleted: false }).select('_id');
  return projects.map(project => project._id);
}

async function getProjectMap(projectIds) {
  const projects = await Project.find({ _id: { $in: projectIds } }).select('name repoName branch envVars activeDeploymentId createdAt');
  return new Map(projects.map(project => [String(project._id), project]));
}

async function getWorkspaceStats(userId, projectIds) {
  const deployments = await Deployment.find({ projectId: { $in: projectIds } })
    .select('status buildDuration startedAt completedAt createdAt updatedAt projectId');

  const totalProjects = projectIds.length;
  const totalDeployments = deployments.length;
  const completedDeployments = deployments.filter(deployment => terminalStatuses.includes(deployment.status));
  const successfulDeployments = completedDeployments.filter(deployment => successStatuses.includes(deployment.status));
  const failedDeployments = completedDeployments.filter(deployment => deployment.status === 'failed');

  const successRate = completedDeployments.length
    ? `${((successfulDeployments.length / completedDeployments.length) * 100).toFixed(1)}%`
    : '0%';

  const durations = deployments
    .map(getDeploymentDurationMs)
    .filter(duration => duration > 0);
  const avgBuildTime = durations.length
    ? formatDuration(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
    : '0s';

  const now = Date.now();
  const currentWindowStart = now - 7 * DAY_MS;
  const previousWindowStart = now - 14 * DAY_MS;

  const currentDeployments = deployments.filter(deployment => new Date(deployment.createdAt).getTime() >= currentWindowStart).length;
  const previousDeployments = deployments.filter(deployment => {
    const ts = new Date(deployment.createdAt).getTime();
    return ts >= previousWindowStart && ts < currentWindowStart;
  }).length;

  const currentProjects = await Project.countDocuments({
    owner: userId,
    isDeleted: false,
    createdAt: { $gte: new Date(currentWindowStart) }
  });
  const previousProjects = await Project.countDocuments({
    owner: userId,
    isDeleted: false,
    createdAt: { $gte: new Date(previousWindowStart), $lt: new Date(currentWindowStart) }
  });

  const delta = (current, previous, suffix = '') => {
    if (previous === 0) return `${current}${suffix}`;
    const diff = (((current - previous) / previous) * 100).toFixed(0);
    return `${diff > 0 ? '+' : ''}${diff}${suffix}`;
  };

  return {
    totalProjects: String(totalProjects),
    totalDeployments: String(totalDeployments),
    successRate,
    avgBuildTime,
    failedDeployments: String(failedDeployments.length),
    runningDeployments: String(deployments.filter(deployment => deployment.status === 'running').length),
    deltas: {
      totalProjects: delta(currentProjects, previousProjects),
      totalDeployments: delta(currentDeployments, previousDeployments),
      successRate: completedDeployments.length ? `${successfulDeployments.length}/${completedDeployments.length}` : '0/0',
      avgBuildTime: durations.length ? `${durations.length} samples` : '0 samples'
    }
  };
}

function buildActivityBars(deployments) {
  const bars = Array.from({ length: 30 }, () => 0);
  const now = Date.now();

  deployments.forEach(deployment => {
    const createdAt = new Date(deployment.createdAt).getTime();
    const dayIndex = 29 - Math.floor((now - createdAt) / DAY_MS);
    if (dayIndex >= 0 && dayIndex < bars.length) {
      bars[dayIndex] += 1;
    }
  });

  return bars;
}

function buildHeatmap(deployments) {
  const now = Date.now();
  const buckets = Array.from({ length: 84 }, (_, index) => {
    const bucketStart = now - (83 - index) * 2 * 60 * 60 * 1000;
    const bucketEnd = bucketStart + 2 * 60 * 60 * 1000;
    const count = deployments.filter(deployment => {
      const ts = new Date(deployment.createdAt).getTime();
      return ts >= bucketStart && ts < bucketEnd;
    }).length;
    return count;
  });

  return buckets;
}

function buildResourceBreakdown(deployments, projects) {
  const totalDeployments = deployments.length || 1;
  const running = deployments.filter(deployment => deployment.status === 'running').length;
  const building = deployments.filter(deployment => ['queued', 'building', 'rolling_back'].includes(deployment.status)).length;
  const failed = deployments.filter(deployment => deployment.status === 'failed').length;

  return [
    {
      label: 'Running Deployments',
      value: String(running),
      pct: Math.round((running / totalDeployments) * 100),
      color: 'bg-white'
    },
    {
      label: 'Build Queue',
      value: String(building),
      pct: Math.round((building / totalDeployments) * 100),
      color: 'bg-[#22c55e]'
    },
    {
      label: 'Projects With Secrets',
      value: String(projects.filter(project => (project.envVars || []).length > 0).length),
      pct: projects.length ? Math.round((projects.filter(project => (project.envVars || []).length > 0).length / projects.length) * 100) : 0,
      color: 'bg-[#3b82f6]'
    },
    {
      label: 'Failed Deployments',
      value: String(failed),
      pct: Math.round((failed / totalDeployments) * 100),
      color: 'bg-[#ef4444]'
    }
  ];
}

function buildNotificationItems(projects, deployments, invites) {
  const deploymentItems = deployments.slice(0, 6).map(deployment => ({
    id: `dep-${deployment._id}`,
    title: `${deployment.projectName || 'Project'} ${deploymentStatusLabel(deployment.status)}`,
    description: deployment.errorMessage || `Branch ${deployment.branch || 'main'} • ${deploymentStatusLabel(deployment.status)}`,
    type: deployment.status === 'failed' ? 'error' : deployment.status === 'running' ? 'success' : 'info',
    createdAt: deployment.createdAt,
    href: deployment.projectId ? `/deploy?projectId=${deployment.projectId}` : '/deploy'
  }));

  const projectItems = projects.slice(0, 3).map(project => ({
    id: `proj-${project._id}`,
    title: `Project created: ${project.name}`,
    description: project.repoName,
    type: 'info',
    createdAt: project.createdAt,
    href: `/settings?projectId=${project._id}`
  }));

  const inviteItems = invites.slice(0, 3).map(invite => ({
    id: `invite-${invite._id}`,
    title: `Member invite pending`,
    description: `${invite.email} • ${invite.role}`,
    type: 'warning',
    createdAt: invite.createdAt,
    href: '/members'
  }));

  return [...deploymentItems, ...projectItems, ...inviteItems]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
}

exports.getWorkspaceOverview = asyncHandler(async (req, res) => {
  const userId = req.workspaceId;
  const projectIds = await getOwnedProjectIds(userId);
  const projects = await Project.find({ _id: { $in: projectIds } })
    .populate('activeDeploymentId', 'status createdAt branch')
    .sort({ createdAt: -1 });
  const deployments = await Deployment.find({ projectId: { $in: projectIds } })
    .sort({ createdAt: -1 })
    .limit(50)
    .select('status branch createdAt errorMessage projectId buildDuration startedAt completedAt');
  const invites = await WorkspaceInvite.find({ owner: userId, status: 'PENDING' })
    .sort({ createdAt: -1 })
    .limit(5);

  const stats = await getWorkspaceStats(userId, projectIds);

  const projectCards = projects.map(project => ({
    id: project._id,
    name: project.name,
    repoName: project.repoName,
    branch: project.branch || 'main',
    status: projectStatusFromDeployment(project.activeDeploymentId),
    variables: (project.envVars || []).length,
    createdAt: project.createdAt
  }));

  const projectMap = new Map(projects.map(project => [String(project._id), project]));
  const recentDeployments = deployments.map(deployment => ({
    id: deployment._id,
    projectId: deployment.projectId,
    name: projectMap.get(String(deployment.projectId))?.name || 'Unknown Project',
    status: String(deployment.status || '').toUpperCase(),
    branch: deployment.branch || 'main',
    time: deployment.createdAt,
    duration: formatDuration(getDeploymentDurationMs(deployment))
  }));

  const environmentPreview = projects
    .flatMap(project => (project.envVars || []).slice(0, 3).map(env => ({
      key: env.key,
      masked: '***',
      projectName: project.name,
      projectId: project._id
    })))
    .slice(0, 6);

  const notifications = buildNotificationItems(
    projects,
    recentDeployments.map(item => ({ ...item, projectName: item.name, createdAt: item.time })),
    invites
  );

  res.status(200).json({
    success: true,
    data: {
      stats: {
        ...stats,
        activityBars: buildActivityBars(deployments)
      },
      recentDeployments,
      projects: projectCards,
      environmentPreview,
      notifications
    }
  });
});

exports.getWorkspaceMetrics = asyncHandler(async (req, res) => {
  const projectIds = await getOwnedProjectIds(req.workspaceId);
  const projects = await Project.find({ _id: { $in: projectIds } }).sort({ createdAt: -1 });
  const deployments = await Deployment.find({ projectId: { $in: projectIds } })
    .sort({ createdAt: -1 })
    .limit(200);

  const stats = await getWorkspaceStats(req.workspaceId, projectIds);
  const completedDeployments = deployments.filter(deployment => terminalStatuses.includes(deployment.status));

  const recentEvents = deployments.slice(0, 12).map(deployment => ({
    id: deployment._id,
    project: projects.find(project => String(project._id) === String(deployment.projectId))?.name || 'Unknown Project',
    event: deploymentStatusLabel(deployment.status),
    timestamp: deployment.createdAt,
    status: deployment.status === 'failed' ? 'Failed' : 'Completed'
  }));

  res.status(200).json({
    success: true,
    data: {
      stats,
      heatmap: buildHeatmap(deployments),
      resourceBreakdown: buildResourceBreakdown(deployments, projects),
      recentEvents
    }
  });
});

exports.getWorkspaceEnvironments = asyncHandler(async (req, res) => {
  const projects = await Project.find({ owner: req.workspaceId, isDeleted: false })
    .populate('activeDeploymentId', 'status')
    .sort({ createdAt: -1 });

  const environments = projects.map(project => ({
    id: project._id,
    name: project.name,
    tag: (project.branch || 'main').slice(0, 12),
    project: project.repoName || project.name,
    branch: project.branch || 'main',
    variables: (project.envVars || []).length,
    status: project.activeDeploymentId?.status === 'running' ? 'ACTIVE' : project.activeDeploymentId?.status === 'failed' ? 'INACTIVE' : 'ACTIVE'
  }));

  const envVars = projects.flatMap(project =>
    (project.envVars || []).map(env => ({
      id: `${project._id}-${env.key}`,
      key: env.key,
      masked: '***',
      projectId: project._id,
      projectName: project.name,
      branch: project.branch || 'main'
    }))
  );

  res.status(200).json({
    success: true,
    data: {
      environments,
      envVars
    }
  });
});

exports.getWorkspaceNotifications = asyncHandler(async (req, res) => {
  const projectIds = await getOwnedProjectIds(req.workspaceId);
  const projects = await Project.find({ _id: { $in: projectIds } }).sort({ createdAt: -1 }).limit(5);
  const deployments = await Deployment.find({ projectId: { $in: projectIds } })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('status branch createdAt errorMessage projectId');
  const invites = await WorkspaceInvite.find({ owner: req.workspaceId }).sort({ createdAt: -1 }).limit(5);

  const projectMap = new Map(projects.map(project => [String(project._id), project]));
  const deploymentItems = deployments.map(deployment => ({
    _id: deployment._id,
    status: deployment.status,
    branch: deployment.branch,
    errorMessage: deployment.errorMessage,
    projectId: deployment.projectId,
    projectName: projectMap.get(String(deployment.projectId))?.name || 'Unknown Project',
    createdAt: deployment.createdAt
  }));

  res.status(200).json({
    success: true,
    data: buildNotificationItems(projects, deploymentItems, invites)
  });
});

exports.getWorkspaceMembers = asyncHandler(async (req, res) => {
  const owner = await User.findById(req.workspaceId).select('username email avatarUrl githubId createdAt');
  const invites = await WorkspaceInvite.find({ owner: req.workspaceId })
    .populate('userId', 'username avatarUrl')
    .sort({ createdAt: -1 })
    .limit(50);

  const members = [
    {
      id: owner._id,
      name: owner.username,
      email: owner.email,
      role: 'OWNER',
      status: 'ACTIVE',
      createdAt: owner.createdAt
    },
    ...invites.map(invite => ({
      id: invite._id,
      name: invite.status === 'ACTIVE' && invite.userId ? invite.userId.username : 'Pending Invite',
      email: invite.email,
      avatarUrl: invite.status === 'ACTIVE' && invite.userId ? invite.userId.avatarUrl : null,
      role: invite.role,
      status: invite.status,
      createdAt: invite.createdAt
    }))
  ];

  res.status(200).json({
    success: true,
    data: members
  });
});

exports.inviteWorkspaceMember = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const role = String(req.body.role || 'DEVELOPER').trim().toUpperCase();

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const allowedRoles = new Set(['ADMIN', 'DEVELOPER', 'VIEWER']);
  if (!allowedRoles.has(role)) {
    res.status(400);
    throw new Error('Role must be ADMIN, DEVELOPER, or VIEWER');
  }

  const inviteToken = crypto.randomBytes(32).toString('hex');

  let invite = await WorkspaceInvite.findOne({ owner: req.workspaceId, email });
  if (invite) {
    invite.role = role;
    invite.status = 'PENDING';
    invite.inviteToken = inviteToken;
    await invite.save();
  } else {
    invite = await WorkspaceInvite.create({
      owner: req.workspaceId,
      email,
      role,
      invitedBy: req.user.id,
      inviteToken
    });
  }

  const acceptUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite?token=${inviteToken}`;
  const ownerUser = await User.findById(req.workspaceId);
  
  await sendEmail({
      to: email,
      subject: `You've been invited to ${ownerUser.username}'s workspace on Velora`,
      html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>You've been invited!</h2>
              <p><strong>${ownerUser.username}</strong> has invited you to join their workspace on Velora as a <strong>${role}</strong>.</p>
              <a href="${acceptUrl}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
                  Accept Invitation
              </a>
          </div>
      `
  });

  res.status(201).json({
    success: true,
    data: {
      id: invite._id,
      name: 'Pending Invite',
      email: invite.email,
      role: invite.role,
      status: invite.status,
      createdAt: invite.createdAt
    }
  });
});

exports.acceptWorkspaceInvite = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        res.status(400); throw new Error('Token is required');
    }

    const invite = await WorkspaceInvite.findOne({ inviteToken: token, status: 'PENDING' });
    if (!invite) {
        res.status(400); throw new Error('Invalid or expired invitation token');
    }

    if (req.user.email.toLowerCase() !== invite.email.toLowerCase()) {
        res.status(400); throw new Error('This invitation was sent to a different email address');
    }

    invite.status = 'ACTIVE';
    invite.userId = req.user.id;
    invite.inviteToken = null;
    await invite.save();

    res.status(200).json({ success: true, message: 'Invitation accepted successfully' });
});

exports.removeWorkspaceMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const invite = await WorkspaceInvite.findOne({ _id: id, owner: req.workspaceId });
    if (!invite) {
        res.status(404); throw new Error('Member not found');
    }
    if (invite.role === 'OWNER') {
        res.status(400); throw new Error('Cannot remove the workspace owner');
    }
    await invite.deleteOne();
    res.status(200).json({ success: true, message: 'Member removed' });
});

exports.getUserWorkspaces = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    
    const personalWorkspace = {
        id: user._id,
        name: user.username + "'s Workspace",
        role: 'OWNER',
        type: 'PERSONAL'
    };

    const invites = await WorkspaceInvite.find({ userId: req.user.id, status: 'ACTIVE' }).populate('owner', 'username');
    
    const teamWorkspaces = invites.map(invite => ({
        id: invite.owner._id,
        name: invite.owner.username + "'s Team",
        role: invite.role,
        type: 'TEAM'
    }));

    res.status(200).json({
        success: true,
        data: [personalWorkspace, ...teamWorkspaces]
    });
});

exports.searchWorkspace = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) {
    return res.status(200).json({ success: true, data: [] });
  }

  const userId = new mongoose.Types.ObjectId(req.workspaceId);
  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  let projectResults = [];

  try {
    projectResults = await Project.aggregate([
      {
        $search: {
          index: 'default',
          text: {
            query,
            path: ['name', 'repoName', 'branch']
          }
        }
      },
      {
        $match: {
          owner: userId,
          isDeleted: false
        }
      },
      { $limit: 6 },
      {
        $project: {
          _id: 1,
          name: 1,
          repoName: 1,
          branch: 1,
          resultType: { $literal: 'project' }
        }
      }
    ]);
  } catch (error) {
    projectResults = await Project.find({
      owner: req.workspaceId,
      isDeleted: false,
      $or: [{ name: regex }, { repoName: regex }, { branch: regex }]
    })
      .limit(6)
      .select('name repoName branch');
  }

  const projectIds = await getOwnedProjectIds(req.workspaceId);
  const projectMap = await getProjectMap(projectIds);
  const deploymentMatches = await Deployment.find({
    projectId: { $in: projectIds },
    $or: [{ branch: regex }, { status: regex }]
  })
    .sort({ createdAt: -1 })
    .limit(6)
    .select('projectId status branch createdAt');

  const memberMatches = await WorkspaceInvite.find({
    owner: req.workspaceId,
    email: regex
  })
    .limit(4)
    .select('email role status createdAt');

  const owner = await User.findById(req.workspaceId).select('username email');

  const results = [
    ...projectResults.map(project => ({
      id: project._id,
      type: 'project',
      title: project.name,
      subtitle: `${project.repoName} • ${project.branch || 'main'}`,
      href: `/settings?projectId=${project._id}`
    })),
    ...deploymentMatches.map(deployment => ({
      id: deployment._id,
      type: 'deployment',
      title: projectMap.get(String(deployment.projectId))?.name || 'Deployment',
      subtitle: `${deploymentStatusLabel(deployment.status)} • ${deployment.branch || 'main'}`,
      href: `/deploy?projectId=${deployment.projectId}`
    })),
    ...(owner && (owner.username.match(regex) || owner.email.match(regex)) ? [{
      id: owner._id,
      type: 'member',
      title: owner.username,
      subtitle: owner.email,
      href: '/account'
    }] : []),
    ...memberMatches.map(invite => ({
      id: invite._id,
      type: 'member',
      title: invite.email,
      subtitle: `${invite.role} • ${invite.status}`,
      href: '/members'
    }))
  ].slice(0, 12);

  res.status(200).json({
    success: true,
    data: results
  });
});
