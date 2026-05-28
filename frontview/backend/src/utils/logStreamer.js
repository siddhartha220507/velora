// utils/logStreamer.js
const Deployment = require('../models/Deployment');

const persistLogLine = async (deploymentId, level, message, logType = 'build') => {
    const entry = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
    const targetField = logType === 'runtime' ? 'runtimeLogs' : 'buildLogs';

    try {
        await Deployment.updateOne(
            { _id: deploymentId },
            {
                $push: {
                    logs: { $each: [entry], $slice: -5000 }, // Keep combined logs for legacy
                    [targetField]: { $each: [entry], $slice: -5000 }
                }
            }
        );
    } catch (error) {
        console.error(`Failed to persist ${logType} log for deployment ${deploymentId}:`, error.message);
    }
};

const streamLogs = (deploymentId, childProcess, io, logType = 'build') => {
    const roomName = `dep:${deploymentId}`;

    // Normal Logs (STDOUT)
    childProcess.stdout.on('data', (data) => {
        const logLines = data.toString().split('\n').filter(line => line.trim() !== '');
        
        logLines.forEach(line => {
            if (io) {
                io.to(roomName).emit('log:line', {
                    timestamp: new Date(),
                    level: 'info',
                    message: line,
                    logType // build or runtime
                });
            }

            persistLogLine(deploymentId, 'info', line, logType);
        });
    });

    // Error Logs (STDERR)
    childProcess.stderr.on('data', (data) => {
        const logLines = data.toString().split('\n').filter(line => line.trim() !== '');
        
        logLines.forEach(line => {
            if (io) {
                io.to(roomName).emit('log:line', {
                    timestamp: new Date(),
                    level: 'error',
                    message: line,
                    logType // build or runtime
                });
            }

            persistLogLine(deploymentId, 'error', line, logType);
        });
    });

    // Jab process khatam ho jaye
    childProcess.on('close', (code) => {
        if (io) {
            io.to(roomName).emit('log:complete', {
                timestamp: new Date(),
                message: `Process exited with code ${code}`,
                logType
            });
        }
    });
};

module.exports = { streamLogs };