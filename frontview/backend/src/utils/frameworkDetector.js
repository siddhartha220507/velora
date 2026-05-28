// utils/frameworkDetector.js
const fs = require('fs').promises;
const path = require('path');

const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'build', '.next', '.turbo']);
const PREFERRED_PATH_NAMES = ['frontend', 'client', 'web', 'app', 'apps', 'ui'];

const pathExists = async (target) => {
    try {
        await fs.access(target);
        return true;
    } catch {
        return false;
    }
};

const STATIC_SERVER_PATH = path.resolve(__dirname, 'staticServer.js');

const parseNodeScriptTarget = (script = '') => {
    const match = String(script).trim().match(/^node\s+["']?([^"']+)["']?$/i);
    return match ? match[1] : null;
};

const isStaticSite = async (projectPath) => {
    const directIndex = path.join(projectPath, 'index.html');
    const publicIndex = path.join(projectPath, 'public', 'index.html');
    return (await pathExists(directIndex)) || (await pathExists(publicIndex));
};

const getStaticServePath = async (projectPath) => {
    const publicIndex = path.join(projectPath, 'public', 'index.html');
    if (await pathExists(publicIndex)) {
        return path.join(projectPath, 'public');
    }
    return projectPath;
};

const scoreCandidatePath = (candidatePath, rootPath) => {
    const rel = path.relative(rootPath, candidatePath).toLowerCase();
    const segments = rel.split(path.sep).filter(Boolean);
    const depth = segments.length;

    let score = depth * 10; // shallow preferred
    if (segments.some((seg) => PREFERRED_PATH_NAMES.includes(seg))) score -= 15;
    if (segments.includes('frontend')) score -= 20;
    if (segments.includes('backend')) score += 10;

    return score;
};

const findCandidateAppPaths = async (rootPath, maxDepth = 5, maxDirs = 600) => {
    const candidates = [];
    const queue = [{ dir: rootPath, depth: 0 }];
    let scannedDirs = 0;

    while (queue.length > 0) {
        const current = queue.shift();
        scannedDirs += 1;
        if (scannedDirs > maxDirs) break;
        const packageJsonPath = path.join(current.dir, 'package.json');
        const indexHtmlPath = path.join(current.dir, 'index.html');

        if (await pathExists(packageJsonPath) || await pathExists(indexHtmlPath)) {
            candidates.push(current.dir);
        }

        if (current.depth >= maxDepth) continue;

        let entries = [];
        try {
            entries = await fs.readdir(current.dir, { withFileTypes: true });
        } catch {
            continue;
        }

        entries
            .filter((entry) => entry.isDirectory() && !IGNORED_DIRS.has(entry.name))
            .forEach((entry) => {
                queue.push({
                    dir: path.join(current.dir, entry.name),
                    depth: current.depth + 1
                });
            });
    }

    const sorted = candidates.sort(
        (a, b) => scoreCandidatePath(a, rootPath) - scoreCandidatePath(b, rootPath)
    );

    return { candidates: sorted, scannedDirs };
};

const resolveProjectPath = async (targetPath) => {
    const { candidates, scannedDirs } = await findCandidateAppPaths(targetPath, 5, 600);

    if (!candidates.length) return { projectPath: null, scannedDirs };
    return { projectPath: candidates[0], scannedDirs };
};

const detectFramework = async (targetPath) => {
    try {
        const { projectPath, scannedDirs } = await resolveProjectPath(targetPath);

        if (!projectPath) {
            return {
                type: 'error',
                error: `No package.json OR index.html found. Scanned ${scannedDirs} directories from repository root.`
            };
        }

        const packageJsonPath = path.join(projectPath, 'package.json');
        
        // 1. Check if package.json exists
        try {
            await fs.access(packageJsonPath);
        } catch {
            // 🌟 NEW: Agar package.json NAHI hai, toh check karo kya index.html hai?
            try {
                const indexPath = path.join(projectPath, 'index.html');
                await fs.access(indexPath);
                return {
                    type: 'frontend-vanilla',
                    projectPath,
                    installCmd: null, // Koi package nahi hai, toh install bhi nahi karna
                    buildCmd: null,   // Koi build nahi chahiye
                    startCmd: 'npx serve -s . -l $PORT' // Direct folder ko serve kar do
                };
            } catch {
                return { type: 'error', error: 'No package.json OR index.html found. Cannot determine project type.' };
            }
        }

        // 2. Read and parse package.json
        const packageData = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        const deps = { ...packageData.dependencies, ...packageData.devDependencies };
        const scripts = packageData.scripts || {};
        const hasIndexHtml = await isStaticSite(projectPath);

        // 3. Detect Vite (Modern React/Vue) - FRONTEND
        if (deps['vite']) {
            return {
                type: 'frontend-vite',
                projectPath,
                installCmd: 'npm install',
                buildCmd: 'npm run build',
                // Vite build 'dist' folder banata hai. npx serve usko live karta hai.
                startCmd: 'npx serve -s dist -l $PORT' 
            };
        }

        // 4. Detect Create React App (Older React) - FRONTEND
        if (deps['react-scripts']) {
            return {
                type: 'frontend-cra',
                projectPath,
                installCmd: 'npm install',
                buildCmd: 'npm run build',
                // CRA 'build' folder banata hai.
                startCmd: 'npx serve -s build -l $PORT'
            };
        }

        if (hasIndexHtml) {
            const configuredNodeEntry = parseNodeScriptTarget(scripts['start']);
            const nodeEntryExists = configuredNodeEntry
                ? await pathExists(path.join(projectPath, configuredNodeEntry))
                : false;

            const explicitBackendDeps = ['express', 'koa', 'fastify', '@nestjs/core', 'hono'];
            const hasBackendSignals = explicitBackendDeps.some((dep) => deps[dep]);
            const servePath = await getStaticServePath(projectPath);

            // If the declared Node entry file does not exist but a static site does,
            // prefer serving the site instead of launching a broken backend command.
            if (configuredNodeEntry && !nodeEntryExists) {
                return {
                    type: 'frontend-static',
                    projectPath,
                    installCmd: null,
                    buildCmd: null,
                    startCmd: `node "${STATIC_SERVER_PATH}" "${servePath}" $PORT`
                };
            }

            if (!hasBackendSignals && !scripts['start']) {
                return {
                    type: 'frontend-static',
                    projectPath,
                    installCmd: null,
                    buildCmd: null,
                    startCmd: `node "${STATIC_SERVER_PATH}" "${servePath}" $PORT`
                };
            }
        }

        // 5. Detect Standard Backend / Node.js
        if (scripts['start']) {
            return {
                type: 'backend-node',
                projectPath,
                installCmd: 'npm install --omit=dev',
                buildCmd: null, // Backend me generally build nahi hota (unless TS ho)
                startCmd: 'npm start'
            };
        }

        if (scripts['dev']) {
            return {
                type: 'backend-node-dev',
                projectPath,
                installCmd: 'npm install --omit=dev',
                buildCmd: null,
                startCmd: 'npm run dev'
            };
        }

        // 6. Fallback (Agar koi script nahi hai, toh main file dhundo intelligently)
        const possibleEntryPoints = [
            packageData.main, 
            'server.js', 
            'app.js', 
            'index.js', 
            'main.js',
            'src/index.js',
            'src/server.js',
            'src/app.js'
        ].filter(Boolean);

        let actualMainFile = 'index.js'; // Ultimate fallback

        for (const file of possibleEntryPoints) {
            try {
                await fs.access(path.join(projectPath, file));
                actualMainFile = file;
                break; // Jo pehli file mil jaye, usko main maan lo
            } catch {
                continue;
            }
        }

        return {
            type: 'backend-fallback',
            projectPath,
            installCmd: 'npm install',
            buildCmd: null,
            startCmd: `node ${actualMainFile}` // e.g., node server.js
        };

    } catch (error) {
        console.error("Detector Error:", error);
        return { type: 'error', error: 'Failed to analyze repository' };
    }
};

module.exports = { detectFramework };
