// models/Integration.js
const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    provider: {
        type: String,
        required: true,
        enum: ['discord', 'mongodb', 'slack', 'redis'] // Kal ko yahan aur add karenge
    },
    type: {
        type: String,
        required: true,
        enum: ['notification', 'database', 'analytics'] // Integration ka kaam kya hai
    },
    config: {
        // Ye sabse important field hai. Ye dynamic JSON store karega.
        // Discord ke case me { webhookUrl: "..." } hoga.
        // Mongo ke case me { uri: "..." } hoga.
        type: Map,
        of: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Integration', integrationSchema);