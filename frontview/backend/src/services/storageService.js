const { createClient } = require('@supabase/supabase-js'); 
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();
global.WebSocket = require('ws');
// Supabase Configuration (Legacy - Keeping as requested)     
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = null;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'velora';

// Storj S3 Configuration (New)
const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  region: "us-east-1", // Default region for Storj
  forcePathStyle: true, 
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'velora-bucket';

/**
 * Uploads a file buffer or string to Storj S3
 */
const uploadFile = async (remotePath, body, contentType = 'application/octet-stream') => {   
    try {
        const command = new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: remotePath,
            Body: body,
            ContentType: contentType,
        });

        await s3.send(command);
        console.log(`âœ… File uploaded to Storj S3: ${remotePath}`);
        return remotePath;
    } catch (error) {
        console.error(`âŒ Storj S3 Upload Failed: ${error.message}`);
        throw error;
    }
};

/**
 * Helper to get all files in a directory recursively
 */
async function getFiles(dir) {
    const dirents = await fs.readdir(dir, { withFileTypes: true });   
    const files = await Promise.all(dirents.map((dirent) => { 
        const res = path.resolve(dir, dirent.name);    
        return dirent.isDirectory() ? getFiles(res) : res;    
    }));
    return Array.prototype.concat(...files);
}

/**
 * Uploads a whole directory to storage in parallel
 */
const uploadDirectory = async (localPath, remotePrefix) => {  
    try {
        const files = await getFiles(localPath);
        console.log(`íº€ Parallel upload started: ${files.length} files`);

        const uploadPromises = files.map(async (file) => {    
            const relativePath = path.relative(localPath, file);
            const remotePath = path.join(remotePrefix, relativePath).replace(/\\/g, '/');
            const content = await fs.readFile(file);

            // Simple mime type detection based on extension
            const ext = path.extname(file).toLowerCase();
            const mimeMap = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.svg': 'image/svg+xml'
            };
            const contentType = mimeMap[ext] || 'application/octet-stream';

            return uploadFile(remotePath, content, contentType);
        });

        await Promise.all(uploadPromises);
        console.log(`âœ… Directory upload completed: ${remotePrefix}`);
        return `https://${process.env.S3_ENDPOINT?.replace('https://', '')}/${S3_BUCKET_NAME}/${remotePrefix}`;
    } catch (error) {
        console.error(`âŒ Directory Upload Failed: ${error.message}`);
        throw error;
    }
};

/**
 * Uploads multiple files (from Folder Upload) to Storage
 */
const uploadProjectFolder = async (deploymentId, files) => {
    const uploadPromises = files.map(file => {
        const content = file.encoding === 'base64' 
            ? Buffer.from(file.content, 'base64') 
            : file.content;
        
        const filePath = `projects/${deploymentId}/${file.path}`;
        return uploadFile(filePath, content);
    });

    return Promise.all(uploadPromises);
};

module.exports = { uploadFile, uploadDirectory, uploadProjectFolder, supabase, s3 };
