const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['OWNER', 'ADMIN', 'DEVELOPER', 'VIEWER'],
        default: 'DEVELOPER'
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'PENDING'],
        default: 'PENDING'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inviteToken: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// User can be in a project team only once
teamMemberSchema.index({ projectId: 1, email: 1 }, { unique: true });

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
module.exports = TeamMember;
