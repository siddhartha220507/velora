// app.js (v2 - restart)
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('./config/passportSetup');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const { protect } = require('./middlewares/authMiddleware');
const deploymentRoutes = require('./routes/deploymentRoutes');
const envRoutes = require('./routes/envRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const compression = require('compression');

// Express app initialize karna
const app = express();

// Trust proxy for Railway/Vercel production environments ðŸ›¡ï¸
app.set('trust proxy', 1);

const { isAllowedOrigin, sessionCookieSameSite, sessionCookieSecure } = require('./config/runtime');

// --- MIDDLEWARES ---

// 1. Compression for faster responses ðŸš€
app.use(compression());

// 2. Helmet for Security Headers
app.use(helmet({
  hsts: false, // Isse HTTPS par auto-upgrade hona band ho jayega
  contentSecurityPolicy: false // CSP errors se bachne ke liye
}));

// 3. Rate Limiting to prevent DDoS/Abuse ðŸ›¡ï¸
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per IP
    message: 'Too many requests, try again later'
});
app.use('/api', limiter);

// 4. Session sabse pehle aayega
// 4. Session configuration
app.use(session({  
    secret: process.env.SESSION_SECRET || 'mera_super_secret',
    resave: false,
    saveUninitialized: false,
    proxy: true, 
    cookie: {
        secure: false, // í±ˆ Ise ekdum false kar do kyunki hum abhi HTTP use kar rahe hain
        httpOnly: true,
        sameSite: 'lax', // í±ˆ OAuth ke liye 'lax' sabse best aur safe hai HTTP par
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
}));

// 5. Passport initialize hoga session ke BAAD
app.use(passport.initialize());
app.use(passport.session());

// 6. CORS - Synchronized with runtime.js
app.use(cors({
    origin: true, // âœ… Yeh har request bhejne waale origin ko allow kar dega
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-workspace-id']
}));

// 6. Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 7. Routes
app.use('/api/auth', authRoutes);
app.get('/auth/google', (req, res) => res.redirect('/api/auth/google'));
app.get('/auth/github', (req, res) => res.redirect('/api/auth/github'));

app.get('/api/auth/test', (req, res) => res.json({ message: "Auth router is reachable" }));

app.get('/api/auth/cleanup-db', async (req, res) => {
    const Project = require('./models/Project');
    const result = await Project.deleteMany({ isDeleted: true });
    const result2 = await Project.deleteMany({ repoUrl: "https://github.com/siddhartha220507/visssh-webpage.git" });
    try {
        await Project.collection.dropIndex('repoUrl_1_owner_1');
    } catch (e) {
        console.log("Index already dropped or doesn't exist");
    }
    res.json({ message: "DB Cleaned & Index Migrated", deletedSoft: result.deletedCount, deletedSpecific: result2.deletedCount });
});

app.use('/api/projects', projectRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/projects', envRoutes);
app.use('/api/projects/:projectId/integrations', integrationRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
    res.send('DeployPilot API is running perfectly!');
});

// Serve frontend build from backend/dist when available
const frontendDistPath = path.resolve(__dirname, '../dist');
app.use(express.static(frontendDistPath));
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// --- ERROR HANDLERS ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
