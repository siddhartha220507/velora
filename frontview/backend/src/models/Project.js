// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        minlength: [3, 'Project name must be at least 3 characters'],
        maxlength: [50, 'Project name cannot exceed 50 characters']
    },
    repoUrl: {
        type: String,
        default: null
    },
    deploymentSource: {
        type: String,
        enum: ['github', 'upload'],
        default: 'github'
    },
    repoName: {
        type: String,
        required: [true, 'Repository name (user/repo) is required']
    },
    branch: {
        type: String,
        default: 'main'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activeDeploymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deployment',
        default: null
    },
    webhookSecret: {
        type: String,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    installCommand: { type: String, default: 'npm install' },
    startCommand: { type: String, default: 'npm start' },
    framework: { 
        type: String, 
        default: 'other',
        enum: ['react', 'nextjs', 'vite', 'nodejs', 'vanilla', 'other']
    },
    envVars: [{
        key: { type: String, required: true },
        encryptedValue: { type: String, required: true },
        iv: { type: String, required: true }
    }]
}, {
    timestamps: true
});

// Indexes - Search ko fast banane ke liye
projectSchema.index({ owner: 1, isDeleted: 1 });
// Ek user ek hi repo ko do baar add na kar paye (Sirf GitHub projects ke liye)
projectSchema.index(
    { repoUrl: 1, owner: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { repoUrl: { $type: "string" } } 
    }
);
projectSchema.index({ status: 1, owner: 1 });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;