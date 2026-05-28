// models/EnvVar.js
const mongoose = require('mongoose');

const envVarSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    key: {
        type: String,
        required: [true, 'Environment variable key is required'],
        match: [/^[a-zA-Z_]+[a-zA-Z0-9_]*$/, 'Key can only contain letters, numbers, and underscores, and cannot start with a number']
    },
    encryptedValue: {
        type: String,
        required: true,
        select: false // SECURITY: Api me kabhi default send nahi hoga
    },
    iv: {
        type: String,
        required: true,
        select: false
    }
}, {
    timestamps: true
});

// Ek project mein same key do baar na ho
envVarSchema.index({ projectId: 1, key: 1 }, { unique: true });

// Custom method - Taaki user ko API response me original value ki jagah *** dikhe
envVarSchema.methods.toJSON = function() {
    const obj = this.toObject();
    obj.value = '***'; // Masking the value for API responses
    delete obj.encryptedValue;
    delete obj.iv;
    return obj;
};

const EnvVar = mongoose.model('EnvVar', envVarSchema);
module.exports = EnvVar;