const axios = require('axios');
const Integration = require('../models/Integration');

/**
 * Sends a notification to all active event triggers (Discord, Slack)
 * for a specific project status change.
 */
exports.notifyIntegrations = async (projectId, deployment, status) => {
    try {
        const integrations = await Integration.find({
            projectId,
            isActive: true,
            type: 'notification'
        });

        if (!integrations.length) return;

        const projectName = deployment.projectName || "Project";
        const message = status === 'success' 
            ? `✅ **Deployment Success!**\nProject: **${projectName}**\nVersion: ${deployment.version}\nStatus: Live`
            : `❌ **Deployment Failed!**\nProject: **${projectName}**\nError: ${deployment.errorMessage || 'Internal Build Error'}`;

        for (const integration of integrations) {
            const config = Object.fromEntries(integration.config);
            
            if (integration.provider === 'discord' && config.webhookUrl) {
                await axios.post(config.webhookUrl, {
                    content: message,
                    username: 'Velora CI/CD',
                    avatar_url: 'https://velora.app/logo.png'
                });
            } else if (integration.provider === 'slack' && config.webhookUrl) {
                await axios.post(config.webhookUrl, {
                    text: message
                });
            }
        }
    } catch (error) {
        console.error('Failed to send notification integration:', error.message);
    }
};
