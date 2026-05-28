const fs = require('fs');
const path = require('path');

const frontendDist = path.resolve(__dirname, '../../frontend/dist');
const backendDist = path.resolve(__dirname, '../dist');

if (!fs.existsSync(frontendDist)) {
  throw new Error(`Frontend build output not found at ${frontendDist}`);
}

fs.rmSync(backendDist, { recursive: true, force: true });
fs.cpSync(frontendDist, backendDist, { recursive: true });

console.log(`Synced frontend dist from ${frontendDist} to ${backendDist}`);
