// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Security ke liye

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true, // Ek email se ek hi account banega
    },
    password: {
        type: String,
        // Required false hai kyunki OAuth (Google/GitHub) mein password nahi hota
        required: false, 
    },
    avatarUrl: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' // Default image
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'github'], // User kahan se aaya hai
        required: true
    },
    googleId: { type: String },
    githubId: { type: String },
    githubAccessToken: { type: String, select: false },
}, {
    timestamps: true
});

// 🛡️ SECURITY HOOK: Data save hone se THEEK PEHLE ye chalega
userSchema.pre('save', async function() {
    // Agar password change nahi hua hai (ya OAuth user hai), toh aage badho
    if (!this.isModified('password') || !this.password) {
        return; 
    }
    
    // Password ko secure (hash) karna
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// METHOD: Login ke time original password aur hashed password ko compare karne ke liye
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
