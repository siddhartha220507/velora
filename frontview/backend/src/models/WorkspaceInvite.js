const mongoose = require('mongoose');

const workspaceInviteSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'DEVELOPER', 'VIEWER'],
      default: 'DEVELOPER'
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'REVOKED'],
      default: 'PENDING'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    inviteToken: {
      type: String,
      default: null
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

workspaceInviteSchema.index({ owner: 1, status: 1, createdAt: -1 });
workspaceInviteSchema.index({ owner: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('WorkspaceInvite', workspaceInviteSchema);
