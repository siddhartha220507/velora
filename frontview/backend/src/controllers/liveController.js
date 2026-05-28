const { Readable } = require('stream');
const asyncHandler = require('../middlewares/asyncHandler');
const Deployment = require('../models/Deployment');

function buildTargetUrl(port, restPath = '', queryString = '') {
    const normalizedPath = restPath ? `/${String(restPath).replace(/^\/+/, '')}` : '/';
    const query = queryString ? `?${queryString}` : '';
    return `http://127.0.0.1:${port}${normalizedPath}${query}`;
}

function rewriteHtmlDocument(html, deploymentId) {
    const prefix = `/live/${deploymentId}`;
    const normalizedPrefix = `${prefix}/`;

    return String(html)
        .replace(/<head([^>]*)>/i, `<head$1><base href="${normalizedPrefix}">`)
        // Rewrite only URL-bearing HTML attributes that start from root.
        .replace(
            /(\b(?:href|src|action|poster)=["'])\/(?!\/)/gi,
            `$1${prefix}/`
        )
        // Rewrite srcset root-relative items: "/a.png 1x, /b.png 2x"
        .replace(
            /(\bsrcset=["'])([^"']*)(["'])/gi,
            (_, start, value, end) => {
                const rewritten = value.replace(/(^|,\s*)\/(?!\/)/g, `$1${prefix}/`);
                return `${start}${rewritten}${end}`;
            }
        );
}

function rewriteUpstreamLocation(locationHeader, deploymentId) {
    if (!locationHeader) return locationHeader;

    const prefix = `/live/${deploymentId}`;
    if (/^https?:\/\//i.test(locationHeader)) {
        try {
            const parsed = new URL(locationHeader);
            return `${prefix}${parsed.pathname}${parsed.search}${parsed.hash}`;
        } catch {
            return locationHeader;
        }
    }

    if (locationHeader.startsWith('/')) {
        return `${prefix}${locationHeader}`;
    }

    return `${prefix}/${locationHeader}`;
}

exports.proxyLiveDeployment = asyncHandler(async (req, res) => {
    const deployment = await Deployment.findById(req.params.id).select('status port');

    if (!deployment) {
        res.status(404);
        throw new Error('Deployment not found');
    }

    if (deployment.status !== 'running' || !deployment.port) {
        res.status(409);
        throw new Error(`Deployment is not live. Current status: ${deployment.status || 'unknown'}`);
    }

    const originalPath = req.originalUrl.split('?')[0];
    const mountPrefix = `/live/${req.params.id}`;
    const restPath = originalPath.startsWith(mountPrefix)
        ? originalPath.slice(mountPrefix.length)
        : req.path;
    const targetUrl = buildTargetUrl(
        deployment.port,
        restPath,
        req.originalUrl.includes('?') ? req.originalUrl.split('?')[1] : ''
    );

    const requestHeaders = { ...req.headers };
    delete requestHeaders.host;
    delete requestHeaders['content-length'];

    const upstreamResponse = await fetch(targetUrl, {
        method: req.method,
        headers: requestHeaders,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
        duplex: ['GET', 'HEAD'].includes(req.method) ? undefined : 'half'
    });

    res.status(upstreamResponse.status);

    upstreamResponse.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'content-length') return;
        // HTML is rewritten by this proxy, so compressed body headers become invalid.
        if (lowerKey === 'content-encoding') return;
        if (lowerKey === 'transfer-encoding') return;
        if (key.toLowerCase() === 'content-security-policy') return;
        if (lowerKey === 'location') {
            res.setHeader(key, rewriteUpstreamLocation(value, deployment._id));
            return;
        }
        res.setHeader(key, value);
    });

    const contentType = upstreamResponse.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
        const html = await upstreamResponse.text();
        res.send(rewriteHtmlDocument(html, deployment._id));
        return;
    }

    if (!upstreamResponse.body) {
        res.end();
        return;
    }

    Readable.fromWeb(upstreamResponse.body).pipe(res);
});
