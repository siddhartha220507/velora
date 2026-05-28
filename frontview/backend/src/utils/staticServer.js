const fs = require('fs');
const path = require('path');
const http = require('http');

const rootDir = path.resolve(process.argv[2] || process.cwd());
const port = Number(process.argv[3] || process.env.PORT || 3000);

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

const safeResolve = (pathname) => {
    const normalized = decodeURIComponent(pathname.split('?')[0]).replace(/^\/+/, '');
    const resolved = path.resolve(rootDir, normalized);
    if (!resolved.startsWith(rootDir)) return null;
    return resolved;
};

const sendFile = (filePath, res) => {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer((req, res) => {
    const requestedPath = safeResolve(req.url || '/');
    if (!requestedPath) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    let filePath = requestedPath;
    if (!path.extname(filePath)) {
        filePath = path.join(filePath, 'index.html');
    }

    fs.stat(filePath, (err, stats) => {
        if (!err && stats.isFile()) {
            sendFile(filePath, res);
            return;
        }

        const fallbackIndex = path.join(rootDir, 'index.html');
        fs.stat(fallbackIndex, (indexErr, indexStats) => {
            if (!indexErr && indexStats.isFile()) {
                sendFile(fallbackIndex, res);
                return;
            }

            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not Found');
        });
    });
});

server.listen(port, () => {
    console.log(`Static site server running from ${rootDir} on port ${port}`);
});
