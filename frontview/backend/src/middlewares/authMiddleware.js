// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');

// Ye humara "Bouncer" function hai
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Check karo ki Header mein Authorization hai aur wo 'Bearer' se start ho raha hai
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                console.warn(`[AUTH] User not found for ID: ${decoded.id}`);
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
            next();
        } catch (error) {
            console.error(`[AUTH] Token Verification Failed: ${error.message}`);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        console.warn('[AUTH] No Bearer token found in request headers');
        res.status(401);
        throw new Error('Not authorized, no token provided');
    }
});

module.exports = { protect };