// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middlewares/asyncHandler');
const {
    frontendUrl,
    sessionCookieSameSite,
    sessionCookieSecure
} = require('../config/runtime');

const serializeUser = (user) => ({
    id: user._id || user.id,
    name: user.username,
    username: user.username,
    email: user.email,
    avatar: user.avatarUrl,
    avatarUrl: user.avatarUrl,
    authProvider: user.authProvider,
    githubId: user.githubId || null,
    googleId: user.googleId || null,
    githubConnected: Boolean(user.githubId)
});

// Helper Function: JWT Token Generate karna
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// ==========================================
// 1. LOCAL REGISTER (Naya Account Banana)
// ==========================================
exports.registerUser = asyncHandler(async (req, res) => {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        username,
        email,
        password,
        authProvider: 'local' // Set provider as local
    });

    if (user) {
        res.status(201).json({
            success: true,
            user: serializeUser(user),
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// ==========================================
// 2. OAUTH & LOCAL SUCCESS CALLBACK
// ==========================================
// Ye function Google, GitHub aur Local Login teeno ke success hone par chalega
exports.authSuccess = (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Authentication Failed');
    }
    const token = generateToken(req.user._id);

    res.cookie('token', token, {
        secure: sessionCookieSecure,
        httpOnly: true,
        sameSite: sessionCookieSameSite,
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Passport ne user ko verify kar diya hai, ab hum apna JWT token bhejenge
    res.status(200).json({
        success: true,
        message: `Logged in successfully via ${req.user.authProvider}`,
        user: serializeUser(req.user),
        token // Backend ticket
    });
};

// ==========================================
// 2.5 OAUTH SPECIFIC SUCCESS CALLBACK (For Github/Google)
// ==========================================
exports.oauthSuccess = (req, res) => {
    console.log(`[OAuth Success] User: ${req.user?.email} via ${req.user?.authProvider}`);
    if (!req.user) {
        console.warn("[OAuth Success] No user found in request");
        return res.redirect(`${frontendUrl}/login?error=AuthenticationFailed`);
    }

    const token = generateToken(req.user._id);
    const redirectUrl = `${frontendUrl}/?token=${encodeURIComponent(token)}`;
    console.log(`[OAuth Success] Redirecting to: ${redirectUrl}`);
    res.redirect(redirectUrl);
};

// ==========================================
// 3. LOGOUT
// ==========================================
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            res.status(500);
            throw new Error('Logout error');
        }
        req.session.destroy();
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    });
};

// ==========================================
// 4. GET CURRENT USER
// ==========================================
exports.getMe = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized');
    }

    res.status(200).json({
        success: true,
        user: serializeUser(req.user)
    });
});

// ==========================================
// 5. UPDATE CURRENT USER
// ==========================================
exports.updateMe = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const { username, email, avatarUrl } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (typeof username === 'string' && username.trim()) {
        user.username = username.trim();
    }

    if (typeof email === 'string' && email.trim()) {
        const normalizedEmail = email.trim().toLowerCase();
        const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
        if (existing) {
            res.status(400);
            throw new Error('Email already in use');
        }
        user.email = normalizedEmail;
    }

    if (typeof avatarUrl === 'string' && avatarUrl.trim()) {
        user.avatarUrl = avatarUrl.trim();
    }

    const updated = await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: serializeUser(updated)
    });
});

exports.updatePassword = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const { currentPassword, newPassword } = req.body;

    if (!newPassword || String(newPassword).trim().length < 6) {
        res.status(400);
        throw new Error('New password must be at least 6 characters long');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.password) {
        if (!currentPassword) {
            res.status(400);
            throw new Error('Current password is required');
        }

        const matches = await user.matchPassword(currentPassword);
        if (!matches) {
            res.status(400);
            throw new Error('Current password is incorrect');
        }
    }

    user.password = String(newPassword).trim();
    if (user.authProvider !== 'local') {
        user.authProvider = 'local';
    }
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password updated successfully'
    });
});
