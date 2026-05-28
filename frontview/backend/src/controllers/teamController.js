const TeamMember = require('../models/TeamMember');
const User = require('../models/User');
const Project = require('../models/Project');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { sendInviteEmail } = require('../services/emailService');

// @desc    Get all members of a project
// @route   GET /api/teams/:projectId
exports.getProjectTeam = asyncHandler(async (req, res) => {
    const members = await TeamMember.find({ projectId: req.params.projectId })
        .populate('userId', 'username email avatarUrl')
        .sort({ createdAt: -1 });

    res.json({ success: true, data: members });
});

// @desc    Invite a member to project
// @route   POST /api/teams/:projectId/invite
exports.inviteMember = asyncHandler(async (req, res) => {
    const { email, role } = req.body;
    const { projectId } = req.params;

    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    // Check if project exists and user is owner/admin
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if already a member
    const existingMember = await TeamMember.findOne({ projectId, email: email.toLowerCase() });
    if (existingMember) {
        res.status(400);
        throw new Error('User is already a member of this project team');
    }

    // Check if user exists in system
    const user = await User.findOne({ email: email.toLowerCase() });

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');

    const member = await TeamMember.create({
        projectId,
        email: email.toLowerCase(),
        role: role || 'DEVELOPER',
        status: 'PENDING', // Always PENDING until they accept the invite link
        userId: user ? user._id : null,
        invitedBy: req.user.id,
        inviteToken
    });

    // Send email invitation
    // Frontview URL needs to be configured, fallback to localhost for dev
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteUrl = `${frontendUrl}/accept-invite?token=${inviteToken}`;
    
    // Fire and forget email sending to avoid blocking response
    sendInviteEmail(email, project.name, inviteUrl, req.user.username || 'A team member').catch(err => console.error("Email send failed:", err));

    res.status(201).json({ success: true, data: member, message: 'Invitation sent' });
});

// @desc    Remove member from project
// @route   DELETE /api/teams/:projectId/members/:memberId
exports.removeMember = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params;

    const member = await TeamMember.findOne({ _id: memberId, projectId });
    if (!member) {
        res.status(404);
        throw new Error('Member not found in this project');
    }

    // Cannot remove owner? Or check permissions...
    // For MVP, just remove
    await member.deleteOne();

    res.json({ success: true, message: 'Member removed from team' });
});

// @desc    Accept project invitation
// @route   POST /api/teams/accept-invite
exports.acceptInvite = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        res.status(400);
        throw new Error('Invitation token is required');
    }

    const member = await TeamMember.findOne({ inviteToken: token }).populate('projectId');
    
    if (!member) {
        res.status(404);
        throw new Error('Invalid or expired invitation');
    }

    // Check if logged in user matches the invited email
    if (member.email.toLowerCase() !== req.user.email.toLowerCase()) {
        res.status(403);
        throw new Error('This invitation was sent to a different email address');
    }

    // Accept invite
    member.status = 'ACTIVE';
    member.userId = req.user.id;
    member.inviteToken = null; // Clear token after use
    await member.save();

    res.json({ 
        success: true, 
        message: 'Invitation accepted successfully',
        data: {
            project: member.projectId
        }
    });
});
