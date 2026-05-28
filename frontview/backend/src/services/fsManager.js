// services/fsManager.js
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');


// Base directory jahan hum saare projects clone karenge (Backend folder ke andar ek 'deployments' folder)
const BASE_DIR = path.join(__dirname, '../../deployments_temp'); 
fs.mkdir(BASE_DIR, { recursive: true }).catch(() => {});


// 1. Repo Clone karne ka function
const cloneRepo = async (repoUrl, deploymentId, branch = 'main', githubAccessToken = null) => {
    const targetPath = path.join(BASE_DIR, deploymentId);

    // Agar same ID ka folder pehle se hai (retry case), toh usko clean kar do
    try {
        await fs.rm(targetPath, { recursive: true, force: true });
    } catch (err) {
        // Ignore agar folder exist nahi karta
    }

    return new Promise((resolve, reject) => {
        console.log(`🚀 Cloning repo into ${targetPath}...`);
        let stderrOutput = '';

        let cloneUrl = repoUrl;
        // Private GitHub repo clone support via OAuth token.
        if (githubAccessToken && /^https:\/\/(www\.)?github\.com\//i.test(repoUrl)) {
            cloneUrl = repoUrl.replace(
                /^https:\/\/(www\.)?github\.com\//i,
                `https://x-access-token:${encodeURIComponent(githubAccessToken)}@github.com/`
            );
        }

        // Child Process: "git clone --depth 1 --branch <branch> <URL> <Path>"
        // --depth 1 se cloning ultra-fast hoti hai kyunki sirf latest code aata hai, poori history nahi
        const gitProcess = spawn('git', ['clone', '--depth', '1', '--branch', branch, cloneUrl, targetPath], {
            env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
        });

        gitProcess.stderr.on('data', (data) => {
            stderrOutput += data.toString();
        });

        gitProcess.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ Cloning successful for ${deploymentId}`);
                resolve(targetPath); // Folder ka path return kar do jahan code rakha hai
            } else {
                const sanitizedError = stderrOutput
                    .replace(/x-access-token:[^@]+@/gi, 'x-access-token:***@')
                    .trim();
                reject(new Error(`Git clone failed with exit code ${code}${sanitizedError ? `: ${sanitizedError}` : ''}`));
            }
        });
    });
};

// 2. .env file create karne ka function
const createEnvFile = async (targetPath, envVars = []) => {
    if (!envVars || envVars.length === 0) return;
    
    const envPath = path.join(targetPath, '.env');
    // Array ko ek string mein convert kar rahe hain: KEY=VALUE format mein
    const envContent = envVars.map(env => `${env.key}=${env.value}`).join('\n');
    
    await fs.writeFile(envPath, envContent);
    console.log(`🔐 .env file created at ${envPath}`);
};

// 3. Direct Uploaded Files likhne ka function (Folder Upload ke liye)
const writeProjectFiles = async (deploymentId, files = []) => {
    const targetPath = path.join(BASE_DIR, deploymentId);
    
    // Clean start
    try {
        await fs.rm(targetPath, { recursive: true, force: true });
    } catch (err) {}
    
    await fs.mkdir(targetPath, { recursive: true });
    
    for (const file of files) {
        // file.path format: "folder/subfolder/file.js"
        const filePath = path.join(targetPath, file.path);
        const dirPath = path.dirname(filePath);
        
        // Folder banao agar nahi hai
        await fs.mkdir(dirPath, { recursive: true });
        
        // File content likho (Assuming content is base64 or raw string)
        const content = file.encoding === 'base64' 
            ? Buffer.from(file.content, 'base64') 
            : file.content;
            
        await fs.writeFile(filePath, content);
    }
    
    return targetPath;
};

module.exports = { cloneRepo, createEnvFile, writeProjectFiles };