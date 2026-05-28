// controllers/envController.js
const Project = require('../models/Project');
const { encrypt } = require('../utils/crypto');
const asyncHandler = require('express-async-handler'); // Agar use kar rahe ho

// @desc    Add or Update Environment Variable
// @route   POST /api/projects/:id/env
exports.addEnvVar = asyncHandler(async (req, res) => {
    const { key, value } = req.body;
    const projectId = req.params.id;

    if (!key || !value) {
        return res.status(400).json({ message: 'Key and Value are required' });
    }

    const project = await Project.findOne({ _id: projectId, owner: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // 🌟 SDE Magic: Encrypt the value before saving
    const { encryptedValue, iv } = encrypt(value);

    // Check agar key pehle se hai toh update karo, warna add karo
    const existingIndex = project.envVars.findIndex(env => env.key === key);
    
    if (existingIndex > -1) {
        project.envVars[existingIndex].encryptedValue = encryptedValue;
        project.envVars[existingIndex].iv = iv;
    } else {
        project.envVars.push({ key, encryptedValue, iv });
    }

    await project.save();

    res.status(201).json({
        success: true,
        data: { key, masked: '***' } // 🌟 Security: Never return actual value
    });
});

// @desc    Get all Env Vars for a project (MASKED)
// @route   GET /api/projects/:id/env
exports.getEnvVars = asyncHandler(async (req, res) => {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Map through and only send keys and masked values
    const safeEnvVars = project.envVars.map(env => ({
        key: env.key,
        masked: '***'
    }));

    res.status(200).json({ success: true, data: safeEnvVars });
});

// @desc    Delete Env Var
// @route   DELETE /api/projects/:id/env/:key
exports.deleteEnvVar = asyncHandler(async (req, res) => {
    const project = await Project.findOneAndUpdate(
        { _id: req.params.id, owner: req.user.id },
        { $pull: { envVars: { key: req.params.key } } },
        { new: true }
    );

    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.status(200).json({ success: true, message: 'Variable deleted' });
});